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




@diagn_bp.route('/issues/<int:system_id>', methods=['GET'])
def get_issues(system_id):
    """Get direct children for any node"""
    print('system id: ', system_id)
    try:
        diagnostics = Diagnostics8d.query.filter(Diagnostics8d.system_id == system_id).all()
        issues = [diagnostic.issue for diagnostic in diagnostics]
        print('\n---------------', issues, '----------------\n')
        return jsonify(
            [{
                'issue': issue.issue
            } for issue in issues]
        )
    
    except Exception as e:    
        print(e)
        return jsonify({"error": e}), 500
    



    

@diagn_bp.route('/root-causes/<int:issue_id>')
def get_root_causes(issue_id):
    try:
        diagnostics = Diagnostics8d.query.filter(Diagnostics8d.issue_id == issue_id).all()
        
        # Convert SQLAlchemy objects to dictionaries
        root_causes = []
        for diagnostic in diagnostics:
            if diagnostic.root_cause:  # Check for null root_cause
                root_causes.append({
                    'id': diagnostic.root_cause.id,
                    'root_cause': diagnostic.root_cause.root_cause
                })
        
        return jsonify(root_causes)  # Return flat array, not nested
    except Exception as e:    
        return jsonify({"error": str(e)}), 500  # Convert exception to string