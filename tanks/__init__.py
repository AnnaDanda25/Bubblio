from flask import Blueprint

tanks = Blueprint('tanks', __name__, url_prefix='/tanks')

from tanks import routes  # importuj dopiero po utworzeniu blueprintu
