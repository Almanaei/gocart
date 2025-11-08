from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date, timezone, timedelta
import uuid

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    client_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    mobile_number = db.Column(db.String(20), nullable=False)
    booking_date = db.Column(db.String(10), nullable=True)
    training_date = db.Column(db.String(10), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='pending')
    organization_name = db.Column(db.String(100))
    address = db.Column(db.String(255))
    attachment_filename = db.Column(db.String(255))

    @staticmethod
    def sanitize_date(date_value):
        if isinstance(date_value, date):
            return date_value
        elif isinstance(date_value, str):
            try:
                return datetime.strptime(date_value, '%Y-%m-%d').date()
            except ValueError:
                return None
        elif isinstance(date_value, int):
            try:
                return date.fromtimestamp(date_value)
            except ValueError:
                return None
        return None

    @classmethod
    def generate_reference_number(cls, date=None):
        if date is None:
            date = datetime.now().date()
        date_str = date.strftime("%Y%m%d")
        last_booking = cls.query.filter(cls.reference_number.like(f"{date_str}-%")).order_by(cls.reference_number.desc()).first()
        if last_booking:
            last_sequence = int(last_booking.reference_number.split('-')[1])
            new_sequence = last_sequence + 1
        else:
            new_sequence = 1
        return f"{date_str}-{new_sequence:04d}"

    def __init__(self, **kwargs):
        super(Booking, self).__init__(**kwargs)
        self.booking_date = self.sanitize_date(kwargs.get('booking_date'))
        self.training_date = self.sanitize_date(kwargs.get('training_date'))

    def to_dict(self):
        return {
            'id': self.id,
            'client_name': self.client_name,
            'email': self.email,
            'mobile_number': self.mobile_number,
            'booking_date': self.booking_date,
            'training_date': self.training_date,
            'status': self.status,
            'attachment_filename': self.attachment_filename,
            'address': self.address,
            'organization_name': self.organization_name
        }

    @staticmethod
    def from_dict(data):
        booking = Booking()
        for field in ['client_name', 'email', 'mobile_number', 'status', 'attachment_filename', 'address', 'organization_name']:
            setattr(booking, field, data.get(field))
        
        for date_field in ['booking_date', 'training_date']:
            setattr(booking, date_field, Booking.sanitize_date(data.get(date_field)))
        
        return booking

    @property
    def parsed_booking_date(self):
        return self.sanitize_date(self.booking_date)

    @property
    def parsed_training_date(self):
        booking_date = self.parsed_booking_date
        if booking_date:
            return booking_date + timedelta(days=30)
        return None

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    is_admin = db.Column(db.Boolean, default=False)  # Add this line
    bookings = db.relationship('Booking', backref='user', lazy='dynamic')
    posts = db.relationship('Post', backref='author', lazy='dynamic')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Certificate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_name = db.Column(db.String(100), nullable=False)
    achievement = db.Column(db.String(200), nullable=False)
    date = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('certificates', lazy='dynamic'))

    def __repr__(self):
        return f'<Certificate {self.id} {self.client_name}>'

class UserLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.String(200))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('logs', lazy='dynamic'))

    def __repr__(self):
        return f'<UserLog {self.id}: {self.action}>'

# Add the Post model
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created = db.Column(db.DateTime, default=datetime.utcnow)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # Remove the duplicate relationship definition here

    def __repr__(self):
        return f'<Post {self.id}: {self.title}>'