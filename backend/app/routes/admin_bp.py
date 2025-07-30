from backend.app import db
from datetime import datetime
from flask import Blueprint, jsonify, request
from backend.app.models.diagnostics_8d import Diagnostics8d
from backend.app.models.product import Product
from backend.app.models.question import Question
from backend.app.models.root_cause import RootCause


admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


# region Routes for the diagnostics8d table

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


@admin_bp.route('/diagnostics8ds/<int:id>', methods=['GET'])
def get_one_8d(id):
    diagnostic_8d = Diagnostics8d.query.get(id)
    if diagnostic_8d == None:
        return jsonify({'error', 'resource not found'}), 404
    else:
        return jsonify(
        {'id': diagnostic_8d.id, 
         'product_id': diagnostic_8d.product_id, 
         'system_version_id': diagnostic_8d.system_version_id,
         'issue': diagnostic_8d.issue,
         'temporary_fix': diagnostic_8d.temporary_fix,
         'root_cause': diagnostic_8d.root_cause,
         'corrective_action': diagnostic_8d.corrective_action,
         'preventative_action': diagnostic_8d.preventative_action,
         'verified_fix': diagnostic_8d.verified_fix,
         'closed': diagnostic_8d.closed,
         'link_8d': diagnostic_8d.link_8d,
         'created_at': diagnostic_8d.created_at,
         'updated_at': diagnostic_8d.updated_at

         })
    





@admin_bp.route('/diagnostics8ds', methods=['POST'])
def add_8d():
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['product','issue']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    product = db.session.get(Product, data['product'])
    if not product:
        return jsonify({'error': 'Invalid product ID'}), 400
    product_id = product.id

    root_cause_id = None
    if data.get('root_cause'):
        root_cause = db.session.get(RootCause, data['root_cause'])
        if root_cause:
            root_cause_id = root_cause.id
    
    try:
        new_diagnostic8d = Diagnostics8d(
            product_id=product_id,
            from_sn=data.get('from_sn'), 
            to_sn=data.get('to_sn'),
            from_version=data.get('from_version'),
            to_version=data.get('to_version'),
            from_supply_date=data.get('from_supply_date'),
            to_supply_date=data.get('to_supply_date'),
            from_sw=data.get('from_sw'),
            to_sw=data.get('to_sw'),
            issue=data['issue'],
            temporary_fix=data.get('temporary_fix'),
            root_cause_id=root_cause_id,
            corrective_action=data.get('corrective_action'),
            preventative_action=data.get('preventative_action'),
            verified_fix=data.get('verified_fix'),
            closed=data.get('closed'),
            link_8d=data.get('link_8d'),
            created_at=datetime.now(),
            updated_at=datetime.now()


            
        )
        db.session.add(new_diagnostic8d)
        db.session.commit()
        return jsonify({'message': '8D Diagnostic created', 'id': new_diagnostic8d.id}), 201

    except Exception as e:
        
        
        db.session.rollback()
        return jsonify({'error': f'Database error occurred'}), 500






@admin_bp.route('/diagnostics8ds/<int:id>', methods=['DELETE'])
def delete_8d(id):
    try:
        deleted_count = Diagnostics8d.query.filter_by(id=id).delete()
        if deleted_count == 0:
            return jsonify({'error': f'No records with id {id}'}), 404
        else:
            db.session.commit()
            return jsonify({'message': 'Record deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error occurred'}), 500



@admin_bp.route('/diagnostics8ds/<int:id>', methods=['PUT'])
def modify_8d(id):
    #TODO
    return None

# endregion

# region Routes for the product table


@admin_bp.route('/products', methods=['GET'])
def get_all_products():
    products = Product.query.all()
    return jsonify([{'id': p.id, 'product': p.product, "created_at": p.created_at, "updated_at": p.updated_at} for p in products]) 

@admin_bp.route('/products/<int:id>', methods=['GET'])
def get_one_product(id):
    product = Product.query.get(id)
    if product == None:
        return jsonify({"error": 'resource not found'}), 404
    else:
        return jsonify({'id': product.id, 'product': product.product, "created_at": product.created_at, "updated_at": product.updated_at})
    


@admin_bp.route('/products', methods=['POST'])
def add_product():
    #TODO
    return None

@admin_bp.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    #TODO
    return None

@admin_bp.route('/products/<int:id>', methods=['PUT'])
def modify_product(id):
    #TODO
    return None

# endregion

# region Routes for the question table

@admin_bp.route('/questions', methods=['GET'])
def get_all_questions():
    questions = Question.query.all()
    return jsonify([{'id': q.id, 
                     'questions': q.question, 
                     "description": q.description, 
                     "help_text_link": q.help_text_link, 
                     "help_image_link": q.help_image_link,
                     "created_at": q.created_at, 
                     "updated_at": q.updated_at} for q in questions]) 

@admin_bp.route('/questions/<int:id>', methods=['GET'])
def get_one_question(id):
    question = Question.query.get(id)
    if question == None:
        return jsonify({'error': 'resource not found'}), 404
    else:
        return jsonify({'id': question.id, 
                     'questions': question.question, 
                     "description": question.description, 
                     "help_text_link": question.help_text_link, 
                     "help_image_link": question.help_image_link,
                     "created_at": question.created_at, 
                     "updated_at": question.updated_at})


@admin_bp.route('/questions', methods=['POST'])
def add_question():
    #TODO
    return None

@admin_bp.route('/questions/<int:id>', methods=['DELETE'])
def delete_question(id):
    #TODO
    return None

@admin_bp.route('/questions/<int:id>', methods=['PUT'])
def modify_question(id):
    #TODO
    return None

# endregion

# region Routes for root causes

@admin_bp.route('/root-causes', methods=['GET'])
def get_all_root_causes():
    root_causes = RootCause.query.all()
    return jsonify([{'id': rc.id, 
                     'root_cause': rc.question,  
                     "created_at": rc.created_at, 
                     "updated_at": rc.updated_at} for rc in root_causes]) 

@admin_bp.route('/root-causes/<int:id>', methods=['GET'])
def get_one_root_cause(id):
    root_cause = RootCause.query.get(id)
    if root_cause == None:
        return jsonify({'error': 'resource not found'}, 404)

    else:
        return jsonify({'id': root_cause.id, 
                     'root_cause': root_cause.question,  
                     "created_at": root_cause.created_at, 
                     "updated_at": root_cause.updated_at})


@admin_bp.route('/root-causes/<int:id>', methods=['POST'])
def add_root_cause(id):
    #TODO
    return None

@admin_bp.route('/root-causes/<int:id>', methods=['DELETE'])
def delete_root_cause(id):
    #TODO
    return None

@admin_bp.route('/root-causes/<int:id>', methods=['PUT'])
def modify_root_cause(id):
    #TODO
    return None

# endregion

# region Routes for system versions

# @admin_bp.route('/system-versions', methods=['GET'])
# def get_all_system_versions():
#     system_versions = RootCause.query.all()
#     return jsonify([{'id': sv.id, 
#                      'from_sn': sv.from_sn,  
#                      'to_sn': sv.to_sn,
#                      'from_version': sv.from_version,
#                      'to_version': sv.to_version,
#                      'from_supply_date': sv.from_supply_date,
#                      'to_supply_date': sv.to_supply_date,
#                      'from_sw': sv.from_sw,
#                      'to_sw': sv.to_sv,
#                      "created_at": sv.created_at, 
#                      "updated_at": sv.updated_at} for sv in system_versions]) 

# @admin_bp.route('/system-versions/<int:id>', methods=['GET'])
# def get_one_system_versions(id):
#     system_version = SystemVersion.query.get(id)
#     if system_version == None:
#         return jsonify({'error': 'Resource not found'}), 404
#     else:
#         return jsonify({'id': system_version.id, 
#                         'from_sn': system_version.from_sn,  
#                         'to_sn': system_version.to_sn,
#                         'from_version': system_version.from_version,
#                         'to_version': system_version.to_version,
#                         'from_supply_date': system_version.from_supply_date,
#                         'to_supply_date': system_version.to_supply_date,
#                         'from_sw': system_version.from_sw,
#                         'to_sw': system_version.to_sv,
#                         "created_at": system_version.created_at, 
#                         "updated_at": system_version.updated_at})


# @admin_bp.route('/system-versions/<int:id>', methods=['POST'])
# def add_system_versions(id):
#     #TODO
#     return None

# @admin_bp.route('/system-versions/<int:id>', methods=['DELETE'])
# def delete_system_versions(id):
#     #TODO
#     return None

# @admin_bp.route('/system-versions/<int:id>', methods=['PUT'])
# def modify_system_versions(id):
#     #TODO
#     return None

# endregion