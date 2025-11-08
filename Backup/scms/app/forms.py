from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, PasswordField, BooleanField, SubmitField, TextAreaField, DateField, SelectField
from wtforms.validators import DataRequired, Email, EqualTo, Length, Optional, ValidationError
from datetime import datetime
from app.models import User

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Sign In')

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    password2 = PasswordField('Repeat Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')

class BookingForm(FlaskForm):
    client_name = StringField('Client Name', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    mobile_number = StringField('Mobile Number', validators=[DataRequired()])
    booking_date = StringField('Booking Date', validators=[DataRequired()])
    training_date = DateField('Training Date', validators=[DataRequired()])
    status = SelectField('Status', choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),  # Add this line
        ('cancelled', 'Cancelled')
    ], validators=[DataRequired()])
    organization_name = StringField('Organization Name')
    address = TextAreaField('Address')
    attachment = FileField('Attachment', validators=[FileAllowed(['pdf', 'doc', 'docx'], 'Only PDF and Word documents are allowed.')])
    submit = SubmitField('Submit')

    def __init__(self, *args, **kwargs):
        super(BookingForm, self).__init__(*args, **kwargs)
        if isinstance(self.booking_date.data, str):
            try:
                self.booking_date.data = datetime.strptime(self.booking_date.data, '%Y-%m-%d').date()
            except ValueError:
                pass
        if isinstance(self.training_date.data, str):
            try:
                self.training_date.data = datetime.strptime(self.training_date.data, '%Y-%m-%d').date()
            except ValueError:
                pass

class PostForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired()])
    content = TextAreaField('Content', validators=[DataRequired()])
    submit = SubmitField('Submit')

class CreateUserForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    is_admin = BooleanField('Admin User')
    submit = SubmitField('Create User')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('That username is already taken. Please choose a different one.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('That email is already in use. Please choose a different one.')

class EditUserForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('New Password', validators=[Optional(), Length(min=6)])
    confirm_password = PasswordField('Confirm New Password', validators=[EqualTo('password')])
    is_admin = BooleanField('Admin User')
    submit = SubmitField('Update User')

    def __init__(self, original_username, *args, **kwargs):
        super(EditUserForm, self).__init__(*args, **kwargs)
        self.original_username = original_username

    def validate_username(self, username):
        if username.data != self.original_username:
            user = User.query.filter_by(username=self.username.data).first()
            if user is not None:
                raise ValidationError('Please use a different username.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is not None and user.username != self.original_username:
            raise ValidationError('Please use a different email address.')

class BackupForm(FlaskForm):
    backup_type = SelectField('Backup Type', choices=[('full', 'Full Backup'), ('incremental', 'Incremental Backup')])
    submit = SubmitField('Create Backup')