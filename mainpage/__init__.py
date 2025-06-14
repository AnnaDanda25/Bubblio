from flask import Blueprint

mainpage = Blueprint('mainpage', __name__, template_folder='../templates')

from mainpage import routes
