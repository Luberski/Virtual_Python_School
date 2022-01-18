from flask import Blueprint
from app.application import application as app

routes = Blueprint("routes", __name__)

from .login import *
from .users import *
from .playground import *


@app.before_first_request
def create_tables():
    db.create_all()
    db.session.commit()

