from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app, send_file
from flask_login import login_required, current_user
from app.models import Booking
from app.forms import BookingForm
from app import db
from datetime import datetime, date, timedelta
from flask import send_from_directory, abort, current_app
import os
from werkzeug.utils import secure_filename
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
from reportlab.lib.utils import ImageReader
from PIL import Image
import io
from sqlalchemy import or_
import sqlalchemy as sa

bp = Blueprint('bookings', __name__)

def parse_date(date_value):
    if isinstance(date_value, (datetime, date)):
        return date_value
    elif isinstance(date_value, str):
        try:
            return datetime.strptime(date_value, '%Y-%m-%d').date()
        except ValueError:
            try:
                return datetime.strptime(date_value, '%d-%m-%Y').date()
            except ValueError:
                current_app.logger.warning(f"Unable to parse date string: {date_value}")
                return date_value  # Return the original string if parsing fails
    elif isinstance(date_value, int):
        try:
            if 1900 <= date_value <= 9999:  # Assuming it's a year
                return date(date_value, 1, 1)
            else:
                return datetime.fromtimestamp(date_value).date()
        except ValueError:
            current_app.logger.warning(f"Unable to parse integer as date: {date_value}")
            return date_value  # Return the original integer if parsing fails
    else:
        current_app.logger.warning(f"Unexpected date type: {type(date_value)}")
        return date_value  # Return the original value if it's an unexpected type

@bp.route('/create', methods=['GET', 'POST'])
@login_required
def create_booking():
    form = BookingForm()
    if form.validate_on_submit():
        try:
            booking = Booking(
                user_id=current_user.id,
                client_name=form.client_name.data,
                email=form.email.data,
                mobile_number=form.mobile_number.data,
                booking_date=form.booking_date.data,
                training_date=form.training_date.data,
                status=form.status.data,
                organization_name=form.organization_name.data,
                address=form.address.data
            )
            
            if form.attachment.data:
                attachment = form.attachment.data
                filename = secure_filename(attachment.filename)
                attachment.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
                booking.attachment_filename = filename
            
            db.session.add(booking)
            db.session.commit()
            flash('Booking created successfully!', 'success')
            return redirect(url_for('bookings.view_bookings'))
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating booking: {str(e)}")
            flash('An error occurred while creating the booking. Please try again.', 'error')
    
    return render_template('bookings/create_booking.html', form=form)

@bp.route('/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_booking(id):
    booking = Booking.query.get_or_404(id)
    if booking.user_id != current_user.id and not current_user.is_admin:
        abort(403)
    form = BookingForm(obj=booking)
    if form.validate_on_submit():
        form.populate_obj(booking)
        db.session.commit()
        flash('Booking updated successfully.', 'success')
        return redirect(url_for('bookings.view_bookings'))
    return render_template('bookings/edit_booking.html', form=form, booking=booking)

@bp.route('/delete/<int:id>', methods=['POST'])
@login_required
def delete_booking(id):
    booking = Booking.query.get_or_404(id)
    db.session.delete(booking)
    db.session.commit()
    flash('Booking deleted successfully!', 'success')
    return redirect(url_for('bookings.view_bookings'))

@bp.route('/view')
@login_required
def view_bookings():
    query = request.args.get('query', '')
    if query:
        return search_bookings()
    
    bookings = Booking.query.filter_by(user_id=current_user.id).all()
    formatted_bookings = []
    for booking in bookings:
        formatted_booking = booking.to_dict()
        formatted_booking['booking_date'] = booking.booking_date if booking.booking_date else 'N/A'
        formatted_booking['training_date'] = booking.training_date if booking.training_date else 'N/A'
        formatted_bookings.append(formatted_booking)
    
    return render_template('bookings/bookings.html', bookings=formatted_bookings, search_query='')

@bp.route('/search', methods=['GET'])
@login_required
def search_bookings():
    query = request.args.get('query', '')
    bookings = Booking.query.filter(
        or_(
            Booking.id.cast(sa.String).like(f'%{query}%'),
            Booking.client_name.ilike(f'%{query}%'),
            Booking.email.ilike(f'%{query}%'),
            Booking.mobile_number.ilike(f'%{query}%'),
            Booking.status.ilike(f'%{query}%')
        )
    ).all()
    
    formatted_bookings = []
    for booking in bookings:
        formatted_booking = booking.to_dict()
        formatted_booking['booking_date'] = booking.booking_date if booking.booking_date else 'N/A'
        formatted_booking['training_date'] = booking.training_date if booking.training_date else 'N/A'
        formatted_bookings.append(formatted_booking)
    
    return render_template('bookings/bookings.html', bookings=formatted_bookings, search_query=query)

@bp.route('/generate_certificate/<int:booking_id>')
@login_required
def generate_certificate(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    
    # Create a BytesIO buffer for the PDF
    buffer = BytesIO()

    # Create the PDF object, using the BytesIO object as its "file."
    p = canvas.Canvas(buffer, pagesize=landscape(letter))

    # Set white background
    p.setFillColor(colors.white)
    p.rect(0, 0, 11*inch, 8.5*inch, fill=True)

    # Add logos
    logo_left_path = os.path.join(current_app.root_path, 'static', 'images', 'logo_left.png')
    logo_right_path = os.path.join(current_app.root_path, 'static', 'images', 'logo_right.png')
    logo_size = 1.5*inch  # 1.5 inches is approximately 15% of the page width

    if os.path.exists(logo_left_path):
        p.drawImage(logo_left_path, 0.5*inch, 7*inch, width=logo_size, height=logo_size, mask='auto')
    if os.path.exists(logo_right_path):
        p.drawImage(logo_right_path, 9*inch, 7*inch, width=logo_size, height=logo_size, mask='auto')

    # Add watermark with very low opacity (barely showing)
    watermark_path = os.path.join(current_app.root_path, 'static', 'images', 'watermark.png')
    if os.path.exists(watermark_path):
        p.saveState()
        p.setFillAlpha(0.05)  # Set fill opacity to 5%
        p.drawImage(watermark_path, 1.5*inch, 2*inch, width=8*inch, height=4.5*inch, mask='auto')
        p.restoreState()

    # Certificate content
    p.setFont("Helvetica-Bold", 30)
    p.setFillColor(colors.navy)
    p.drawCentredString(5.5*inch, 6*inch, "Certificate of Completion")
    
    p.setFont("Helvetica", 20)
    p.setFillColor(colors.black)
    p.drawCentredString(5.5*inch, 5*inch, "This is to certify that")
    
    p.setFont("Helvetica-Bold", 24)
    p.setFillColor(colors.darkgreen)
    p.drawCentredString(5.5*inch, 4*inch, booking.client_name)
    
    p.setFont("Helvetica", 20)
    p.setFillColor(colors.black)
    p.drawCentredString(5.5*inch, 3*inch, "has successfully completed the training on")
    
    p.setFont("Helvetica-Bold", 22)
    p.setFillColor(colors.darkred)
    p.drawCentredString(5.5*inch, 2*inch, str(booking.training_date))

    # Add stamp
    stamp_path = os.path.join(current_app.root_path, 'static', 'images', 'stamp.png')
    if os.path.exists(stamp_path):
        p.drawImage(stamp_path, 1*inch, 1*inch, width=2*inch, height=2*inch, mask='auto')

    # Add signature line
    p.setStrokeColor(colors.black)
    p.line(7*inch, 1.5*inch, 10*inch, 1.5*inch)
    p.setFont("Helvetica", 12)
    p.setFillColor(colors.black)
    p.drawCentredString(8.5*inch, 1*inch, "Authorized Signature")

    # Close the PDF object cleanly, and we're done.
    p.showPage()
    p.save()

    # FileResponse sets the Content-Disposition header so that browsers
    # present the option to save the file.
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f'certificate_{booking.client_name}.pdf', mimetype='application/pdf')

@bp.route('/view_attachment/<int:booking_id>')
@login_required
def view_attachment(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    if booking.attachment_filename:
        uploads_dir = current_app.config['UPLOAD_FOLDER']
        return send_from_directory(uploads_dir, booking.attachment_filename)
    else:
        abort(404)  # Return a 404 error if no attachment is found

@bp.route('/update_booking_statuses')
@login_required
def update_booking_statuses():
    today = datetime.now().date()
    bookings_to_update = Booking.query.filter(
        Booking.training_date < today,
        Booking.status.in_(['pending', 'approved'])
    ).all()

    for booking in bookings_to_update:
        booking.status = 'completed'

    db.session.commit()
    
    return f"Updated {len(bookings_to_update)} bookings to completed status."