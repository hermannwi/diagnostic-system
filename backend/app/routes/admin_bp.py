from .. import db
from datetime import datetime
from flask import Blueprint, jsonify, request
from sqlalchemy import exc
from ..models.diagnostics_8d import Diagnostics8d
from ..models.product import Product
from ..models.question import Question
from ..models.root_cause import RootCause


admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


# region Routes for the diagnostics8d table

@admin_bp.route('/diagnostics8ds', methods=['GET'])
def get_all_8ds():
    diagnostics_8ds = Diagnostics8d.query.all()
    return jsonify([
        {'id': d.id, 
         'product_id': d.product_id, 
         'from_sn': d.from_sn,  
         'to_sn': d.to_sn,
         'from_version': d.from_version,
         'to_version': d.to_version,
         'from_supply_date': d.from_supply_date,
         'to_supply_date': d.to_supply_date,
         'from_sw': d.from_sw,
         'to_sw': d.to_sw,
         'issue': d.issue,
         'questions': [{'id': q.id, 'question': q.question} for q in d.questions],
         'temporary_fix': d.temporary_fix,
         'root_cause_id': d.root_cause_id,
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
    diagnostic_8d = db.session.get(Diagnostics8d, id)
    if diagnostic_8d == None:
        return jsonify({'error', 'resource not found'}), 404
    else:
        return jsonify(
            dict_8d(diagnostic_8d))
    

def dict_8d(diagnostic_8d):
        return {'id': diagnostic_8d.id, 
         'product_id': diagnostic_8d.product_id, 
         'from_sn': diagnostic_8d.from_sn,  
         'to_sn': diagnostic_8d.to_sn,
         'from_version': diagnostic_8d.from_version,
         'to_version': diagnostic_8d.to_version,
         'from_supply_date': diagnostic_8d.from_supply_date,
         'to_supply_date': diagnostic_8d.to_supply_date,
         'from_sw': diagnostic_8d.from_sw,
         'to_sw': diagnostic_8d.to_sw,
         'issue': diagnostic_8d.issue,
         'questions': [{'id': q.id, 'question': q.question} for q in d.questions],
         'temporary_fix': diagnostic_8d.temporary_fix,
         'root_cause_id': diagnostic_8d.root_cause_id,
         'corrective_action': diagnostic_8d.corrective_action,
         'preventative_action': diagnostic_8d.preventative_action,
         'verified_fix': diagnostic_8d.verified_fix,
         'closed': diagnostic_8d.closed,
         'link_8d': diagnostic_8d.link_8d,
         'created_at': diagnostic_8d.created_at,
         'updated_at': diagnostic_8d.updated_at

         }



@admin_bp.route('/diagnostics8ds', methods=['POST'])
def add_8d():
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['product','issue', 'closed']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    product = db.session.get(Product, data['product'])
    if not product:
        return jsonify({'error': 'Invalid product ID'}), 400
    product_id = product.id

    
        
    
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
            root_cause_id=data.get('root_cause_id'),
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
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['product','issue']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    product = db.session.get(Product, data['product'])
    if not product:
        return jsonify({'error': 'Invalid product'}), 400
    product_id = product.id

    root_cause_id = None
    if data.get('root_cause'):
        root_cause = db.session.get(RootCause, data['root_cause'])
        if root_cause:
            root_cause_id = root_cause.id
    
    try:
        retrieved_8d = db.session.get(Diagnostics8d, id)
        if retrieved_8d == None:
            return jsonify({'error': 'data not found'}), 404
        else:
            retrieved_8d.product_id=product_id
            retrieved_8d.from_sn=data.get('from_sn') 
            retrieved_8d.to_sn=data.get('to_sn')
            retrieved_8d.from_version=data.get('from_version')
            retrieved_8d.to_version=data.get('to_version')
            retrieved_8d.from_supply_date=data.get('from_supply_date')
            retrieved_8d.to_supply_date=data.get('to_supply_date')
            retrieved_8d.from_sw=data.get('from_sw')
            retrieved_8d.to_sw=data.get('to_sw')
            retrieved_8d.issue=data['issue']
            retrieved_8d.temporary_fix=data.get('temporary_fix')
            retrieved_8d.root_cause_id=root_cause_id
            retrieved_8d.corrective_action=data.get('corrective_action')
            retrieved_8d.preventative_action=data.get('preventative_action')
            retrieved_8d.verified_fix=data.get('verified_fix')
            retrieved_8d.closed=data.get('closed')
            retrieved_8d.link_8d=data.get('link_8d')
            retrieved_8d.created_at=retrieved_8d.created_at
            retrieved_8d.updated_at=datetime.now()

            db.session.commit()
            return jsonify({'message': '8D Diagnostic updated', 'id': id, 'object': dict_8d(retrieved_8d)}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Debug - Actual error: {e}")
        return jsonify({'error': f'Database error occurred'}), 500 
    


# def connect_new_question_to_8d(id, data):
#     diagnostic_8d = db.session.get(Diagnostics8d, id)
#     if diagnostic_8d == None:
#         return jsonify({'error': f'No 8d with id {id}'}), 404
#     new_question = create_question_service(data)
#     try:
        
        
#         db.session.add(new_question)
#         diagnostic_8d.questions.append(new_question)
#         db.session.commit()
#         return jsonify({
#             'diagnostics_8d_id': id,
#             'question_id': new_question.id
#         }), 201

#     except Exception as e:
#         db.session.rollback()
#         print(f"Debug - Actual error: {e}")
#         return jsonify({'error': f'Database error occurred'}), 500 
        


@admin_bp.route('/diagnostics8ds/<int:id>/questions', methods=['POST']) 
def connect_question_to_8d(id):
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    required_fields = ['question']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    
    try:
        existing_question = Question.query.filter_by(question=data['question']).first()
        diagnostic_8d = db.session.get(Diagnostics8d, id)
        if diagnostic_8d is None:
            return jsonify({'error': f'No 8d with id {id}'}), 404
        if existing_question:
            
            diagnostic_8d.questions.append(existing_question)
            db.session.commit()
            return jsonify({
                'diagnostics_8d_id': id,
                'question_id': existing_question.id
            }), 201
        else:
            new_question = create_question_service(data)
            db.session.add(new_question)
            diagnostic_8d.questions.append(new_question)
            db.session.commit()
            return jsonify({
                'diagnostics_8d_id': id,
                'question_id': new_question.id
            }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Debug - Actual error: {e}")
        return jsonify({'error': f'Database error occurred'}), 500

    
    



# def connect_existing_question_to_8d(id, question):
    
#     diagnostic_8d = db.session.get(Diagnostics8d, id)
#     if diagnostic_8d == None:
#         return jsonify({'error': f'No 8d with id {id}'}), 404
#     question = db.session.get(Question, question.id)
#     if question == None:
#         return jsonify({'error': f'No question with id {question.id}'}), 404 
#     try:
#         diagnostic_8d.questions.append(question)
#         db.session.commit()
#         return jsonify({
#             'diagnostics_8d_id': id,
#             'question_id': question.id
#         }), 201
#     except Exception as e:
#         return jsonify({'error': 'Database error occured'}), 500


# endregion

# region Routes for the product table


@admin_bp.route('/products', methods=['GET'])
def get_all_products():
    products = Product.query.all()
    return jsonify([{'id': p.id, 'product': p.product, "created_at": p.created_at, "updated_at": p.updated_at} for p in products]) 

@admin_bp.route('/products/<int:id>', methods=['GET'])
def get_one_product(id):
    product = db.session.get(Product, id)
    if product == None:
        return jsonify({"error": 'resource not found'}), 404
    else:
        return jsonify({'id': product.id, 'product': product.product, "created_at": product.created_at, "updated_at": product.updated_at})
    


@admin_bp.route('/products', methods=['POST'])
def add_product():
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['product']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        new_product = Product(
            product=data['product'],
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({
            'id': new_product.id,
            'product': new_product.product,
            'created_at': new_product.created_at,
            'updated_at': new_product.updated_at
        }), 201
    
    except exc.IntegrityError as e:
        db.session.rollback()
        if 'UNIQUE constraint failed' in str(e):
            return jsonify({'error': 'Product already exists'}), 409
        return jsonify({'error': 'Data integrity error'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    


@admin_bp.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    try:
        deleted_count = Product.query.filter_by(id=id).delete()
        if deleted_count == 0:
            return jsonify({'error': f'No records with id {id}'}), 404
        else:
            db.session.commit()
            return jsonify({'message': 'Record deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error occurred'}), 500



@admin_bp.route('/products/<int:id>', methods=['PUT'])
def modify_product(id):
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    required_fields = ['product']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        product_to_be_modified = db.session.get(Product, id)
        if product_to_be_modified == None:
            return jsonify({'error': 'data not found'}), 404
        else:
            product_to_be_modified.product = data['product']
            product_to_be_modified.updated_at = datetime.now()

            db.session.commit()
            return jsonify({
                'id': product_to_be_modified.id,
                'product': product_to_be_modified.product,
                'created_at': product_to_be_modified.created_at,
                'updated_at': product_to_be_modified.updated_at
            }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Debug - Actual error: {e}")
        return jsonify({'error': f'Database error occurred'}), 500 
    
    


# endregion

# region Routes for the question table

@admin_bp.route('/questions', methods=['GET'])
def get_all_questions():
    questions = Question.query.all()
    return jsonify([{'id': q.id, 
                     'question': q.question, 
                     "description": q.description, 
                     "help_text_link": q.help_text_link, 
                     "help_image_link": q.help_image_link,
                     "created_at": q.created_at, 
                     "updated_at": q.updated_at} for q in questions]) 

@admin_bp.route('/questions/<int:id>', methods=['GET'])
def get_one_question(id):
    question = db.session.get(Question, id)
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
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
   

    required_fields = ['question']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    

    try:
        new_question = create_question_service(data)
        db.session.add(new_question)
        db.session.commit()
        return jsonify({
            'id': new_question.id,
            'question': new_question.question,
            'description': new_question.description,
            'help_text_link': new_question.help_text_link,
            'help_image_link': new_question.help_image_link,
            'created_at': new_question.created_at,
            'updated_at': new_question.updated_at
        }), 201


    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500


@admin_bp.route('/questions/<int:id>', methods=['DELETE'])
def delete_question(id):
    try:
        deleted_count = Question.query.filter_by(id=id).delete()
        if deleted_count == 0:
            return jsonify({'error': f'No records with id {id}'}), 404
        else:
            db.session.commit()
            return jsonify({'message': 'Record deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Debug - Actual error: {e}")
        return jsonify({'error': f'Database error occurred'}), 500


@admin_bp.route('/questions/<int:id>', methods=['PUT'])
def modify_question(id):
    data = request.json
    if not data: 
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['question']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        question_to_be_modified = db.session.get(Question, id)
        if question_to_be_modified == None:
            return jsonify({'error': 'data not found'}), 404
        else:
            question_to_be_modified.question=data['question']
            question_to_be_modified.description=data.get('description')
            question_to_be_modified.help_text_link=data.get('help_text_link')
            question_to_be_modified.help_image_link=data.get('help_image_link')
            question_to_be_modified.updated_at=datetime.now()

            db.session.commit()
            return jsonify({
                'id': question_to_be_modified.id,
                'question': question_to_be_modified.question,
                'description': question_to_be_modified.description,
                'help_text_link': question_to_be_modified.help_text_link,
                'help_image_link': question_to_be_modified.help_image_link,
                'created_at':question_to_be_modified.created_at,
                'updated_at': question_to_be_modified.updated_at
            }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Debug - Actual error: {e}")
        return jsonify({'error': f'Database error occurred'}), 500 


    


# endregion

# region Routes for root causes

@admin_bp.route('/root-causes', methods=['GET'])
def get_all_root_causes():
    root_causes = RootCause.query.all()
    return jsonify([{'id': rc.id, 
                     'root_cause': rc.root_cause,  
                     "created_at": rc.created_at, 
                     "updated_at": rc.updated_at} for rc in root_causes]) 

@admin_bp.route('/root-causes/<int:id>', methods=['GET'])
def get_one_root_cause(id):
    root_cause = db.session.get(RootCause, id)
    if root_cause == None:
        return jsonify({'error': 'resource not found'}), 404

    else:
        return jsonify({'id': root_cause.id, 
                     'root_cause': root_cause.root_cause,  
                     "created_at": root_cause.created_at, 
                     "updated_at": root_cause.updated_at})


@admin_bp.route('/root-causes', methods=['POST'])
def add_root_cause():
    data = request.json

    if not data:
        return jsonify({'error': 'No data provided'}), 400
   

    required_fields = ['root_cause']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        new_root_cause = RootCause(
            root_cause = data['root_cause'],
            created_at = datetime.now(),
            updated_at = datetime.now()
        )
        db.session.add(new_root_cause)
        db.session.commit()
        return jsonify({
            'id': new_root_cause.id,
            'root_cause': new_root_cause.root_cause,
            'created_at': new_root_cause.created_at,
            'updated_at': new_root_cause.updated_at
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500

@admin_bp.route('/root-causes/<int:id>', methods=['DELETE'])
def delete_root_cause(id):
    try:
        deleted_count = RootCause.query.filter_by(id=id).delete()
        if deleted_count == 0:
            return jsonify({'error': f'No records with id {id}'}), 404
        else:
            db.session.commit()
            return jsonify({'message': 'Record deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error occurred'}), 500
    

@admin_bp.route('/root-causes/<int:id>', methods=['PUT'])
def modify_root_cause(id):
    data = request.json

    if not data:
        return jsonify({'error': 'No data provided'}), 400
   

    required_fields = ['root_cause']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        root_cause_to_be_modified = db.session.get(RootCause, id)
        if root_cause_to_be_modified == None:
            return jsonify({'error': 'data not found'}), 404
        else:
            root_cause_to_be_modified.root_cause = data['root_cause']
            root_cause_to_be_modified.updated_at = datetime.now()

            db.session.commit()
            return jsonify({
                'id': root_cause_to_be_modified.id,
                'root_cause': root_cause_to_be_modified.root_cause,
                'created_at': root_cause_to_be_modified.created_at,
                'updated_at': root_cause_to_be_modified.updated_at
            })
    except Exception as e:
        db.session.rollback()
        print(f"Debug - Actual error: {e}")
        return jsonify({'error': f'Database error occurred'}), 500 

# endregion



def create_question_service(question_data):
        new_question = Question(
            question=question_data['question'],
            description=question_data.get('description'),
            help_text_link=question_data.get('help_text_link'),
            help_image_link=question_data.get('help_image_link'),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        return new_question


   