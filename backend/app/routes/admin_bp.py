from backend.app import db
from flask import Blueprint, jsonify
from backend.app.models.diagnostics_8d import Diagnostics8d
from backend.app.models.product import Product
from backend.app.models.question import Question
from backend.app.models.root_cause import RootCause
from backend.app.models.system_version import SystemVersion

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


# Routes for the diagnostics8d table

@admin_bp.route('/diagnostics8ds', methods=['GET'])
def get_all_8ds():
    diagnostics_8ds = Diagnostics8d.query.all()
    return jsonify([
        {'id': d.id, 
         'product_id': d.product_id, 
         'system_version_id': d.system_version_id,
         'issue': d.issue,
         'temporary_fix': d.temporary_fix,
         'root_cause': d.root_cause,
         'corrective_action': d.corrective_action,
         'preventative_action': d.preventative_action,
         'verified_fix': d.verified_fix,
         'closed': d.closed,
         'link_8d': d.link_8d,
         'created_at': d.created_at,
         'updated_at': d.updated_at

         } for d in diagnostics_8ds])

# Routes for the product table




@admin_bp.route('/products', methods=['GET'])
def get_all_products():
    products = Product.query.all()
    return jsonify([{'id': p.id, 'product': p.product, "created_at": p.created_at, "updated_at": p.updated_at} for p in products]) 

@admin_bp.route('/products/<id>', methods=['GET'])
def get_one_product():
    #TODO
    return None


@admin_bp.route('/products', methods=['POST'])
def add_product():
    #TODO
    return None

@admin_bp.route('/products', methods=['DELETE'])
def delete_product():
    #TODO
    return None

@admin_bp.route('/products', methods=['PUT'])
def modify_product():
    #TODO
    return None