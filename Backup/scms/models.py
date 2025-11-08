from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
db = SQLAlchemy()

class Booking(db.Model):
    # ... other fields ...
    status = db.Column(db.String(20), nullable=True, default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # ... other fields ...