from .. import db
from datetime import datetime
from flask import Blueprint, jsonify, request
from sqlalchemy import exc
from ..models.diagnostics_8d import Diagnostics8d
from ..models.system import System
from ..models.product import Product
from ..models.part import Part
from ..models.question import Question
from ..models.root_cause import RootCause

diagn_bp = Blueprint("diagn", __name__, url_prefix="/diagn")


# ═════════════════════════════════════════════════════════
#  1. SYSTEM & HIERARCHY ENDPOINTS
# ═════════════════════════════════════════════════════════

@diagn_bp.route('/systems', methods=['GET'])
def get_all_systems():
    systems = System.query.all()
    return jsonify([
        {'id': s.id, 
         'system': s.system,
         'products': [{'id': p.id, 'product': p.product} for p in s.products],
         'created_at': s.created_at,
         'updated_at': s.updated_at

         } for s in systems])




@diagn_bp.route('/diagnostics/<int:parent_id>', methods=['GET'])
def get_issues(system_id):
    """Get direct children for any node"""
    try:
        diagnostics = Diagnostics8d.query.filter(Diagnostics8d.system_id == system_id).all()
        issues = [diagnostic.issue for diagnostic in diagnostics]
        return jsonify([
            {'issues': issues}
        ])
    
    except Exception as e:    
        return jsonify({"error": e}), 500