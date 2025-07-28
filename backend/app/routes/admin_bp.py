from flask import Blueprint
from backend.app.models.diagnostics_8d import Diagnostics8d
from backend.app.models.product import Product
from backend.app.models.question import Question
from backend.app.models.root_cause import RootCause
from backend.app.models.system_version import SystemVersion

admin = Blueprint("admin", __name__, url_prefix="/admin")




@admin_bp.route('/products', methods=['GET'])
def get_all_products():
