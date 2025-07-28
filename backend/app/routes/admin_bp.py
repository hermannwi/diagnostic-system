from backend.app import db
from flask import Blueprint, jsonify
from backend.app.models.diagnostics_8d import Diagnostics8d
from backend.app.models.product import Product
from backend.app.models.question import Question
from backend.app.models.root_cause import RootCause
from backend.app.models.system_version import SystemVersion

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.route('/products', methods=['GET'])
def get_all_products():
    products = Product.query.all()
    return jsonify([{'id': p.id, 'product': p.product, "created_at": p.created_at, "updated_at": p.updated_at} for p in products]) 