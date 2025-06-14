from flask import Blueprint

diary = Blueprint('diary', __name__, url_prefix='/diary')

from diary import routes  # import po utworzeniu blueprintu
