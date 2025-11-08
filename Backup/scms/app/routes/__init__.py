# This file can be empty or you can add any shared functionality for routes here

from flask import Blueprint

bp = Blueprint('main', __name__)

from . import views