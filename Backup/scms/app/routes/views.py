from flask import current_app, render_template, redirect, url_for, flash, request, send_from_directory, abort
from flask_login import login_required, current_user, logout_user, login_user
from . import bp
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

# Routes

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
    try:
        bookings_query = Booking.query.filter_by(user_id=current_user.id)
        bookings_data = []
        for booking in bookings_query:
            booking_dict = booking.to_dict()
            for date_field in ['booking_date', 'training_date']:
                date_value = getattr(booking, date_field)
                if isinstance(date_value, date):
                    booking_dict[date_field] = date_value.strftime('%Y-%m-%d')
                elif isinstance(date_value, str):
                    try:
                        parsed_date = datetime.strptime(date_value, '%Y-%m-%d').date()
                        booking_dict[date_field] = parsed_date.strftime('%Y-%m-%d')
                    except ValueError:
                        booking_dict[date_field] = None
                else:
                    booking_dict[date_field] = None
            bookings_data.append(booking_dict)
        return render_template('view_bookings.html', bookings=bookings_data)
    except Exception as e:
        current_app.logger.error(f"Error retrieving bookings: {str(e)}")
        error_message = "An error occurred while retrieving bookings. Please try again later."
        return render_template('view_bookings.html', bookings=None, error_message=error_message)

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
            'start': parsed_training_date.isoformat() if parsed_training_date else None,
            'url': url_for('main.edit_booking', id=booking.id),
            'color': '#28a745' if booking.status == 'approved' else '#ffc107'
        })
    return render_template('bookings/booking_calendar.html', calendar_events=calendar_events)

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
    return render_template('auth/login.html', title='Sign In', form=form)

@bp.route('/create_user', methods=['GET', 'POST'])
@login_required
def create_user():
    if not current_user.is_admin:
        flash('You do not have permission to create users.', 'danger')
        return redirect(url_for('main.index'))
    
    form = CreateUserForm()
    if form.validate_on_submit():
        existing_user = User.query.filter_by(email=form.email.data).first()
        if existing_user:
            flash('A user with that email already exists.', 'danger')
        else:
            new_user = User(
                username=form.username.data,
                email=form.email.data,
                is_admin=form.is_admin.data
            )
            new_user.set_password(form.password.data)
            db.session.add(new_user)
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
def view_users():
    if not current_user.is_admin:
        flash('You do not have permission to view all users.', 'danger')
        return redirect(url_for('main.index'))
    users = User.query.all()
    return render_template('users/view_users.html', users=users)

@bp.route('/edit_user/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_user(id):
    if not current_user.is_admin:
        flash('You do not have permission to edit users.', 'danger')
        return redirect(url_for('main.index'))
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
    return render_template('users/edit_user.html', form=form, user=user)

@bp.route('/delete_user/<int:id>', methods=['POST'])
@login_required
def delete_user(id):
    if not current_user.is_admin:
        flash('You do not have permission to delete users.', 'danger')
        return redirect(url_for('main.index'))
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    flash('User deleted successfully.', 'success')
    return redirect(url_for('main.view_users'))

@bp.route('/statistics')
@login_required
def statistics():
    if not current_user.is_admin:
        flash('You do not have permission to view statistics.', 'danger')
        return redirect(url_for('main.index'))

    total_bookings = Booking.query.count()
    current_month = datetime.now().replace(day=1)
    monthly_bookings = Booking.query.filter(Booking.booking_date >= current_month).count()
    completed_bookings = Booking.query.filter_by(status='completed').count()
    completion_rate = (completed_bookings / total_bookings) * 100 if total_bookings > 0 else 0

    last_30_days = datetime.now() - timedelta(days=30)
    daily_bookings = db.session.query(
        func.date(Booking.booking_date).label('date'),
        func.count(Booking.id).label('count')
    ).filter(Booking.booking_date >= last_30_days).group_by(func.date(Booking.booking_date)).all()

    status_distribution = db.session.query(
        Booking.status, func.count(Booking.id)
    ).group_by(Booking.status).all()

    top_clients = db.session.query(
        Booking.client_name, func.count(Booking.id).label('booking_count')
    ).group_by(Booking.client_name).order_by(func.count(Booking.id).desc()).limit(5).all()

    new_users_last_30_days = User.query.filter(User.created_at >= last_30_days).count()

    return render_template('statistics.html',
                           total_bookings=total_bookings,
                           monthly_bookings=monthly_bookings,
                           completion_rate=completion_rate,
                           daily_bookings=daily_bookings,
                           status_distribution=status_distribution,
                           top_clients=top_clients,
                           new_users=new_users_last_30_days)

@bp.route('/manual_backup', methods=['GET', 'POST'])
@login_required
def manual_backup():
    if not current_user.is_admin:
        flash('You do not have permission to perform backups.', 'danger')
        return redirect(url_for('main.index'))

    form = BackupForm()
    if form.validate_on_submit():
        backup_type = form.backup_type.data
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = os.path.join(current_app.root_path, '..', 'backups')
        os.makedirs(backup_dir, exist_ok=True)

        if backup_type == 'full':
            backup_filename = f'full_backup_{timestamp}.zip'
            backup_path = os.path.join(backup_dir, backup_filename)
            shutil.make_archive(backup_path[:-4], 'zip', current_app.root_path)
        else:  # incremental
            backup_filename = f'incremental_backup_{timestamp}.zip'
            backup_path = os.path.join(backup_dir, backup_filename)
            db_file = current_app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
            shutil.copy2(db_file, backup_path)

        flash(f'{backup_type.capitalize()} backup created successfully: {backup_filename}', 'success')
        return redirect(url_for('main.manual_backup'))

    return render_template('manual_backup.html', form=form)

@bp.route('/create_booking', methods=['GET', 'POST'])
@login_required
def create_booking():
    form = BookingForm()
    if form.validate_on_submit():
        booking_date = form.booking_date.data
        training_date = booking_date + timedelta(days=30) if booking_date else None
        
        attachment_filename = None
        if form.attachment.data:
            attachment = form.attachment.data
            attachment_filename = secure_filename(attachment.filename)
            attachment_path = os.path.join(current_app.config['UPLOAD_FOLDER'], attachment_filename)
            attachment.save(attachment_path)
        
        booking = Booking(
            user_id=current_user.id,
            client_name=form.client_name.data,
            email=form.email.data,
            mobile_number=form.mobile_number.data,
            booking_date=booking_date,
            training_date=training_date,
            status=form.status.data,
            organization_name=form.organization_name.data,
            address=form.address.data,
            attachment_filename=attachment_filename
        )
        db.session.add(booking)
        db.session.commit()
        flash('Booking created successfully!', 'success')
        return redirect(url_for('main.view_bookings'))

    return render_template('bookings/create_booking.html', form=form)

@bp.route('/edit_booking/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_booking(id):
    booking = Booking.query.get_or_404(id)
    form = BookingForm(obj=booking)
    if form.validate_on_submit():
        booking.client_name = form.client_name.data
        booking.email = form.email.data
        booking.mobile_number = form.mobile_number.data
        booking.booking_date = form.booking_date.data
        booking.training_date = form.booking_date.data + timedelta(days=30) if form.booking_date.data else None
        booking.address = form.address.data
        booking.status = form.status.data
        booking.organization_name = form.organization_name.data
        if form.attachment.data:
            attachment = form.attachment.data
            attachment_filename = secure_filename(attachment.filename)
            attachment_path = os.path.join(current_app.config['UPLOAD_FOLDER'], attachment_filename)
            attachment.save(attachment_path)
            booking.attachment_filename = attachment_filename
        db.session.commit()
        flash('Booking updated successfully', 'success')
        return redirect(url_for('main.view_bookings'))
    return render_template('bookings/edit_booking.html', form=form, booking=booking)

@bp.route('/posts')
@login_required
def view_posts():
    posts = Post.query.order_by(Post.created.desc()).all()
    return render_template('posts/view_posts.html', posts=posts)

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
    return render_template('posts/create_post.html', title='Create Post', form=form)

@bp.route('/uploads/<filename>')
@login_required
def uploaded_file(filename):
    uploads_dir = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(uploads_dir, filename)

