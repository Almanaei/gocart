from flask import render_template, current_app, Blueprint, redirect, url_for, flash, request, abort
from flask_login import login_required, current_user, logout_user, login_user
from app.models import User, Booking, Post, Certificate
from app.forms import LoginForm, PostForm, CreateUserForm, EditUserForm, BookingForm, BackupForm
from app import db
from urllib.parse import urlparse
from sqlalchemy import func
from datetime import datetime, timedelta, date
import os
from werkzeug.utils import secure_filename
from flask_wtf import FlaskForm
from wtforms import SelectField, SubmitField
import shutil
from functools import wraps

# Create a Blueprint
bp = Blueprint('main', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

@bp.route('/')
@login_required
def index():
    total_bookings = Booking.query.count()
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_bookings = Booking.query.filter(Booking.booking_date >= thirty_days_ago).count()
    pending_bookings = Booking.query.filter_by(status='pending').count()
    total_certificates = Certificate.query.count()
    recent_posts = Post.query.order_by(Post.created.desc()).limit(5).all()
    upcoming_bookings = Booking.query.filter(Booking.booking_date >= datetime.now().date()).order_by(Booking.booking_date).limit(5).all()
    
    for booking in upcoming_bookings:
        if isinstance(booking.booking_date, datetime):
            booking.booking_date = booking.booking_date.strftime('%Y-%m-%d')

    status_distribution = db.session.query(Booking.status, func.count(Booking.id)).group_by(Booking.status).all()
    status_distribution = [{'status': status, 'count': count} for status, count in status_distribution]
    total_users = User.query.count()

    return render_template('index.html', 
                           total_bookings=total_bookings,
                           recent_bookings=recent_bookings,
                           pending_bookings=pending_bookings,
                           total_certificates=total_certificates,
                           recent_posts=recent_posts,
                           upcoming_bookings=upcoming_bookings,
                           status_distribution=status_distribution,
                           total_users=total_users)

@bp.route('/view_bookings')
@login_required
def view_bookings():
    bookings = Booking.query.all()
    formatted_bookings = []
    for booking in bookings:
        formatted_booking = booking.__dict__.copy()
        formatted_booking['booking_date'] = booking.booking_date.strftime('%Y-%m-%d') if booking.booking_date else 'N/A'
        formatted_booking['training_date'] = booking.training_date.strftime('%Y-%m-%d') if booking.training_date else 'N/A'
        formatted_booking['attachment_url'] = url_for('main.uploaded_file', filename=booking.attachment_filename) if booking.attachment_filename else None
        formatted_bookings.append(formatted_booking)
    return render_template('view_bookings.html', bookings=formatted_bookings)

@bp.route('/booking_calendar')
@login_required
def booking_calendar():
    bookings = Booking.query.all()
    calendar_events = []
    for booking in bookings:
        parsed_training_date = booking.training_date
        if isinstance(parsed_training_date, str):
            parsed_training_date = datetime.strptime(parsed_training_date, '%Y-%m-%d')
        calendar_events.append({
            'title': f"{booking.client_name} - {booking.status}",
            'start': parsed_training_date.isoformat(),
            'url': url_for('main.edit_booking', id=booking.id),
            'color': '#28a745'
        })
    return render_template('booking_calendar.html', calendar_events=calendar_events)

@bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.index'))

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password', 'danger')
            return redirect(url_for('main.login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or urlparse(next_page).netloc != '':
            next_page = url_for('main.index')
        return redirect(next_page)
    return render_template('login.html', title='Sign In', form=form)

@bp.route('/create_user', methods=['GET', 'POST'])
@login_required
@admin_required
def create_user():
    form = CreateUserForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        user.is_admin = form.is_admin.data
        db.session.add(user)
        try:
            db.session.commit()
            flash('User created successfully!', 'success')
            return redirect(url_for('main.view_users'))
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating user: {str(e)}")
            flash('An error occurred while creating the user. Please try again.', 'danger')
    
    return render_template('users/create_user.html', title='Create User', form=form)

@bp.route('/view_users')
@login_required
@admin_required
def view_users():
    users = User.query.all()
    return render_template('users/view_users.html', users=users)

@bp.route('/edit_user/<int:id>', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_user(id):
    user = User.query.get_or_404(id)
    form = EditUserForm(obj=user)
    if form.validate_on_submit():
        user.username = form.username.data
        user.email = form.email.data
        user.is_admin = form.is_admin.data
        if form.password.data:
            user.set_password(form.password.data)
        db.session.commit()
        flash('User updated successfully.', 'success')
        return redirect(url_for('main.view_users'))
    elif request.method == 'GET':
        form.username.data = user.username
        form.email.data = user.email
        form.is_admin.data = user.is_admin
    return render_template('users/edit_user.html', form=form, user=user)

@bp.route('/delete_user/<int:id>', methods=['POST'])
@login_required
@admin_required
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    flash('User deleted successfully.', 'success')
    return redirect(url_for('main.view_users'))

@bp.route('/statistics')
@login_required
def statistics():
    total_bookings = Booking.query.count()
    monthly_bookings = Booking.query.filter(Booking.booking_date >= (datetime.now() - timedelta(days=30))).count()
    completed_bookings = Booking.query.filter_by(status='completed').count()
    completion_rate = (completed_bookings / total_bookings) * 100 if total_bookings > 0 else 0
    new_users = User.query.filter(User.created_at >= (datetime.now() - timedelta(days=30))).count()

    # Booking trends (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    daily_bookings = db.session.query(
        func.date(Booking.booking_date).label('date'),
        func.count(Booking.id).label('count')
    ).filter(Booking.booking_date >= thirty_days_ago).group_by(func.date(Booking.booking_date)).all()

    # Status distribution
    status_distribution = db.session.query(Booking.status, func.count(Booking.id)).group_by(Booking.status).all()

    # Top 5 clients
    top_clients = db.session.query(
        Booking.client_name,
        func.count(Booking.id).label('booking_count')
    ).group_by(Booking.client_name).order_by(func.count(Booking.id).desc()).limit(5).all()

    return render_template('statistics.html',
                           total_bookings=total_bookings,
                           monthly_bookings=monthly_bookings,
                           completion_rate=completion_rate,
                           new_users=new_users,
                           daily_bookings=daily_bookings,
                           status_distribution=status_distribution,
                           top_clients=top_clients)

@bp.route('/manual_backup', methods=['GET', 'POST'])
@login_required
@admin_required
def manual_backup():
    form = BackupForm()
    if form.validate_on_submit():
        backup_type = form.backup_type.data
        try:
            if backup_type == 'full':
                # Perform full backup
                shutil.copy2('app.db', 'backup_full.db')
                flash('Full backup created successfully.', 'success')
            elif backup_type == 'incremental':
                # Perform incremental backup (simplified example)
                shutil.copy2('app.db', f'backup_incremental_{datetime.now().strftime("%Y%m%d%H%M%S")}.db')
                flash('Incremental backup created successfully.', 'success')
            return redirect(url_for('main.index'))
        except Exception as e:
            flash(f'Backup failed: {str(e)}', 'danger')
    return render_template('manual_backup.html', form=form)

@bp.route('/view_posts')
@login_required
def view_posts():
    posts = Post.query.order_by(Post.created.desc()).all()
    return render_template('view_posts.html', posts=posts)

@bp.route('/create_post', methods=['GET', 'POST'])
@login_required
def create_post():
    form = PostForm()
    if form.validate_on_submit():
        post = Post(title=form.title.data, content=form.content.data, author=current_user)
        db.session.add(post)
        db.session.commit()
        flash('Your post has been created!', 'success')
        return redirect(url_for('main.view_posts'))
    return render_template('create.html', title='Create Post', form=form)

@bp.route('/post/<int:id>')
@login_required
def view_post(id):
    post = Post.query.get_or_404(id)
    return render_template('view.html', post=post)

@bp.route('/post/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def edit_post(id):
    post = Post.query.get_or_404(id)
    if post.author != current_user:
        abort(403)
    form = PostForm()
    if form.validate_on_submit():
        post.title = form.title.data
        post.content = form.content.data
        db.session.commit()
        flash('Your post has been updated!', 'success')
        return redirect(url_for('main.view_post', id=post.id))
    elif request.method == 'GET':
        form.title.data = post.title
        form.content.data = post.content
    return render_template('edit.html', title='Edit Post', form=form, post=post)

@bp.route('/post/<int:id>/delete', methods=['POST'])
@login_required
def delete_post(id):
    post = Post.query.get_or_404(id)
    if post.author != current_user:
        abort(403)
    db.session.delete(post)
    db.session.commit()
    flash('Your post has been deleted!', 'success')
    return redirect(url_for('main.view_posts'))

def init_app(app):
    app.register_blueprint(bp)