from flask import Blueprint

mainpage = Blueprint('mainpage', __name__, url_prefix='/main')

from mainpage import routes
