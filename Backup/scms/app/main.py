from flask import Blueprint

main = Blueprint('main', __name__)

# Remove all route definitions from this file

# Import routes at the bottom to avoid circular imports
from app import routes