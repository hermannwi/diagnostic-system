#!/usr/bin/env python3
"""
Diagnostic System Backend Server
Flask + SQLite3 implementation
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import json
from typing import List, Dict, Any, Optional
import logging
import traceback

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_PATH = './test_db2.db'


def get_db_connection():
    """Create a database connection with row factory for dict-like access"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn


def dict_from_row(row):
    """Convert sqlite3.Row to dict"""
    return dict(zip(row.keys(), row))


# ═════════════════════════════════════════════════════════
#  1. SYSTEM & HIERARCHY ENDPOINTS
# ═════════════════════════════════════════════════════════

@app.route('/api/systems', methods=['GET'])
def get_systems():
    """Get all root systems (parent = 0)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT id,
                   error_type,
                   (SELECT COUNT(*) FROM init_diagn c WHERE c.parent = init_diagn.id) AS child_count
              FROM init_diagn
             WHERE parent = 0
             ORDER BY error_type COLLATE NOCASE
        """
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        result = [dict_from_row(row) for row in rows]
        
        conn.close()
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in get_systems: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/diagnostics/<int:parent_id>', methods=['GET'])
def get_diagnostics(parent_id):
    """Get direct children for any node"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT id,
                   error_type,
                   parent,
                   (SELECT COUNT(*) FROM init_diagn c WHERE c.parent = init_diagn.id) AS child_count
              FROM init_diagn
             WHERE parent = ?
             ORDER BY error_type COLLATE NOCASE
        """
        
        cursor.execute(query, (parent_id,))
        rows = cursor.fetchall()
        
        result = [dict_from_row(row) for row in rows]
        
        conn.close()
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in get_diagnostics: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/diagnostics/hierarchy/<int:system_id>', methods=['GET'])
def get_hierarchy(system_id):
    """Get full recursive hierarchy"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        def walk_tree(parent_id):
            """Recursively walk the tree and collect all descendants"""
            results = []
            
            cursor.execute(
                "SELECT id, error_type, parent FROM init_diagn WHERE parent = ?",
                (parent_id,)
            )
            children = cursor.fetchall()
            
            for child in children:
                child_dict = dict_from_row(child)
                results.append(child_dict)
                # Recursively get children of this child
                results.extend(walk_tree(child['id']))
            
            return results
        
        all_descendants = walk_tree(system_id)
        
        conn.close()
        return jsonify(all_descendants)
    
    except Exception as e:
        logger.error(f"Error in get_hierarchy: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ═════════════════════════════════════════════════════════
#  2. CONF-ERROR ROUTE
# ═════════════════════════════════════════════════════════

@app.route('/api/conferrors/<int:init_diagn_id>', methods=['GET'])
def get_conferrors(init_diagn_id):
    """Get conferrors for a specific initial diagnosis"""
    # try:
    # Validate input
    if init_diagn_id <= 0:
        logger.warning(f"Bad initDiagnId: {init_diagn_id}")
        return jsonify({"error": "Bad initDiagnId"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get search table data
    cursor.execute(
        "SELECT * FROM search_table WHERE init_diagn_id = ?",
        (init_diagn_id,)
    )
    search_rows = cursor.fetchall()
    
    if not search_rows:
        conn.close()
        return jsonify([])
    
    # Calculate total for probability
    total_cnt = sum(row['cnt'] for row in search_rows)
    
    result = []
    
    for search_row in search_rows:
        conferror_id = search_row['conferror_id']
        
        # Get conferror core data
        cursor.execute("""
            SELECT id,
                    full_value,
                    system,
                    part_no,
                    d2e_description,
                    d3e_containment_act,
                    d4e_root_cause,
                    d5e_action_performed
                FROM conf_error
                WHERE id = ?
        """, (conferror_id,))
        
        ce_data = cursor.fetchone()
        if not ce_data:
            continue
        
        # Get questions for this conferror
        cursor.execute(
            "SELECT * FROM conferror_questions WHERE conferror_id = ?",
            (conferror_id,)
        )
        q_refs = cursor.fetchall()
        
        # Get question details
        questions = []
        for q_ref in q_refs:
            print(q_ref)
            cursor.execute(
                "SELECT * FROM diagn_questions WHERE id = ?",
                (q_ref['conferror_question'],)
            )
            q_data = cursor.fetchone()
            
            if q_data:
                questions.append({
                    'id': q_data['id'],
                    'family': q_data['family'] or '',  # Using 'question' column
                    'text': q_data['question'] or '',
                    'description': q_data['description'] or None,          # Text description
                    'text_help_link': q_data['help_text_link'] or None,   # URL to documentation
                    'image_help_link': q_data['help_image_link'] or None 
                })

        
        
        # Get description
        cursor.execute(
            "SELECT d2e_description FROM conf_error WHERE id = ?",
            (conferror_id,)
        )
        desc_data = cursor.fetchone()
        
        # Build conferror object
        conferror = {
            'id': conferror_id,
            'name': ce_data['full_value'] or f"Error {conferror_id}",
            'probability': search_row['cnt'] / total_cnt if total_cnt > 0 else 0,
            'questions': questions,
            'system': ce_data['system'] or '',
            'part_no': ce_data['part_no'] or '',
            'd2e_description': ce_data['d2e_description'] or  '',
            'd3e_containment_act': ce_data['d3e_containment_act'],
            'd4e_root_cause': ce_data['d4e_root_cause'],
            'd5e_action_performed': ce_data['d5e_action_performed']
        }
        
        result.append(conferror)
    
    conn.close()
    return jsonify(result)
    
    # except Exception as e:
    #     logger.error(f"Error in get_conferrors: {str(e)}")
    #     return jsonify({"error": str(e)}), 500


# ═════════════════════════════════════════════════════════
#  3. ADDITIONAL ROUTES
# ═════════════════════════════════════════════════════════

@app.route('/api/question/<int:question_id>', methods=['GET'])
def get_question(question_id):
    """Get individual question details"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT * FROM diagn_questions WHERE id = ?",
            (question_id,)
        )
        row = cursor.fetchone()
        
        if row:
            result = dict_from_row(row)
        else:
            result = None
        
        conn.close()
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in get_question: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/calculate-probabilities', methods=['POST'])
def calculate_probabilities():
    """Calculate adjusted probabilities based on answers"""
    try:
        data = request.get_json()
        conferrors = data.get('conferrors', [])
        answers = data.get('answers', {})
        
        if not conferrors or answers is None:
            return jsonify({"error": "Missing conferrors or answers"}), 400
        
        # Calculate adjusted probabilities
        adjusted_conferrors = []
        
        for conferror in conferrors:
            adjusted_probability = conferror['probability']
            
            # Apply multipliers based on answers
            for question in conferror.get('questions', []):
                q_id = str(question['id'])  # Convert to string as JS object keys are strings
                if q_id in answers:
                    if answers[q_id]:
                        adjusted_probability *= 1.6  # Increase by 60% for yes
                    else:
                        adjusted_probability *= 0.5  # Decrease by 50% for no
            
            adjusted_conferror = conferror.copy()
            adjusted_conferror['adjustedProbability'] = adjusted_probability
            adjusted_conferrors.append(adjusted_conferror)
        
        # Normalize probabilities to sum to 1
        total_adjusted = sum(c['adjustedProbability'] for c in adjusted_conferrors)
        
        if total_adjusted > 0:
            for conferror in adjusted_conferrors:
                conferror['adjustedProbability'] /= total_adjusted
        
        # Sort by adjusted probability (descending)
        adjusted_conferrors.sort(key=lambda x: x['adjustedProbability'], reverse=True)
        
        return jsonify(adjusted_conferrors)
    
    except Exception as e:
        logger.error(f"Error in calculate_probabilities: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ═════════════════════════════════════════════════════════
#  4. ERROR HANDLERS & SERVER STARTUP
# ═════════════════════════════════════════════════════════

@app.route('/api/diagnostic-session', methods=['POST'])
def save_diagnostic_session():
    """Save a complete diagnostic session"""
    try:
        data = request.get_json()
        
        # Extract data from request
        session_data = {
            'vessel': data.get('vessel'),
            'system': data.get('system'),
            'serial': data.get('serial'),
            'selected_diagnostics': data.get('selectedDiagnostics', []),
            'final_error_id': data.get('finalErrorId'),
            'final_error_name': data.get('finalErrorName'),
            'questions_answered': data.get('questionsAnswered', {}),
            'problem_fixed': data.get('problemFixed', None),
            'timestamp': data.get('timestamp'),
            'contact_consent': data.get('contactConsenst', None),
            'user_feedback': data.get('feedbackText', None),
            

        }
        
        # Here you can save to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create a diagnostic_sessions table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS diagnostic_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vessel TEXT,
                system TEXT,
                serial TEXT,
                selected_diagnostics TEXT,
                final_error_id INTEGER,
                final_error_name TEXT,
                questions_answered TEXT,
                problem_fixed BOOLEAN,
                user_feedback TEXT,
                contact_consent BOOLEAN,
                timestamp TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Insert the session data. new initial diagnostic not yet added.
        cursor.execute("""
            INSERT INTO diagnostic_sessions 
            (vessel, system, serial, selected_diagnostics, final_error_id, 
             final_error_name, questions_answered, problem_fixed, user_feedback, contact_consent, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)  
        """, (
            session_data['vessel'],
            session_data['system'],
            session_data['serial'],
            json.dumps(session_data['selected_diagnostics']),
            session_data['final_error_id'],
            session_data['final_error_name'],
            json.dumps(session_data['questions_answered']),
            session_data['problem_fixed'],
            session_data['user_feedback'],
            session_data['contact_consent'],
            session_data['timestamp']
        ))
        
        conn.commit()
        session_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'message': 'Diagnostic session saved successfully'
        })
        
    except Exception as e:
        logger.error(f"Error saving diagnostic session: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/diagnostic-session/<int:session_id>', methods=['PATCH'])
def update_diagnostic_session(session_id):
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()

        update_fields = []
        params = []

        
        if 'problemFixed' in data:
            update_fields.append('problem_fixed = ?')
            params.append(data['problemFixed'])
            
        if 'contactConsent' in data:
            update_fields.append('contact_consent = ?')
            params.append(data['contactConsent'])
            
        if 'feedbackText' in data:
            update_fields.append('feedback_text = ?')
            params.append(data['feedbackText'])


        # Build and execute query
        query = f"""
            UPDATE diagnostic_sessions 
            SET {', '.join(update_fields)}
            WHERE id = ?
        """
        params.append(session_id)
        
        cursor.execute(query, params)
        conn.commit()


        if cursor.rowcount == 0:
            return jsonify({"error": "Session not found"}), 404
            
        conn.close()
        return jsonify({"success": True, "session_id": session_id})


    except Exception as e:
        logger.error(f"Error updating session: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/diagnostic-session/<int:session_id>', methods=['GET'])
def get_diagnostic_session(session_id):
    """Retrieve a specific diagnostic session"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM diagnostic_sessions WHERE id = ?
        """, (session_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            session = dict_from_row(row)
            # Parse JSON fields
            session['selected_diagnostics'] = json.loads(session['selected_diagnostics'])
            session['questions_answered'] = json.loads(session['questions_answered'])
            return jsonify(session)
        else:
            return jsonify({'error': 'Session not found'}), 404
            
    except Exception as e:
        logger.error(f"Error retrieving session: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/diagnostic-sessions', methods=['GET'])
def get_all_diagnostic_sessions():
    """Get all diagnostic sessions with optional filtering"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get query parameters for filtering
        vessel = request.args.get('vessel')
        system = request.args.get('system')
        problem_fixed = request.args.get('problem_fixed')
        
        query = "SELECT * FROM diagnostic_sessions WHERE 1=1"
        params = []
        
        if vessel:
            query += " AND vessel = ?"
            params.append(vessel)
        if system:
            query += " AND system = ?"
            params.append(system)
        if problem_fixed is not None:
            query += " AND problem_fixed = ?"
            params.append(problem_fixed == 'true')
            
        query += " ORDER BY created_at DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        sessions = []
        for row in rows:
            session = dict_from_row(row)
            session['selected_diagnostics'] = json.loads(session['selected_diagnostics'])
            session['questions_answered'] = json.loads(session['questions_answered'])
            sessions.append(session)
            
        conn.close()
        return jsonify(sessions)
        
    except Exception as e:
        logger.error(f"Error retrieving sessions: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/diagnostic-stats', methods=['POST'])
def get_diagnostic_stats():
    """Get statistics for a specific diagnostic-conferror combination"""
    try:
        data = request.get_json()
        init_diagn_ids = data.get('initDiagnIds', [])
        final_error_id = data.get('finalErrorId')
        
        if not init_diagn_ids or not final_error_id:
            return jsonify({"error": "Missing required parameters"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        stats = {}
        
        # Get stats for each init_diagn
        for init_diagn_id in init_diagn_ids:
            # Query to get percentage of successful fixes
            query = """
                SELECT 
                    COUNT(*) as total_cases,
                    SUM(CASE WHEN problem_fixed = 1 THEN 1 ELSE 0 END) as fixed_cases,
                    AVG(CASE WHEN problem_fixed = 1 THEN 1.0 ELSE 0.0 END) * 100 as percentage_fixed
                FROM diagnostic_sessions AS t
                WHERE EXISTS (
                    SELECT 1
                    FROM json_each(t.selected_diagnostics) AS sd
                    WHERE json_extract(sd.value,'$.id') = ?
                )
                AND final_error_id = ?
            """
            
            cursor.execute(query, (init_diagn_id, final_error_id))
            result = cursor.fetchone()
            
            if result and result['total_cases'] > 0:
                stats[init_diagn_id] = {
                    'total_cases': result['total_cases'],
                    'fixed_cases': result['fixed_cases'],
                    'percentage_fixed': round(result['percentage_fixed'], 1)
                }
            else:
                stats[init_diagn_id] = {
                    'total_cases': 0,
                    'fixed_cases': 0,
                    'percentage_fixed': 0
                }
        
        # Get overall stats for this error
        overall_query = """
            SELECT 
                COUNT(*) as total_cases,
                SUM(CASE WHEN problem_fixed = 1 THEN 1 ELSE 0 END) as fixed_cases,
                AVG(CASE WHEN problem_fixed = 1 THEN 1.0 ELSE 0.0 END) * 100 as percentage_fixed
            FROM diagnostic_sessions
            WHERE final_error_id = ?
        """
        
        cursor.execute(overall_query, (final_error_id,))
        overall_result = cursor.fetchone()
        
        overall_stats = {
            'total_cases': overall_result['total_cases'] if overall_result else 0,
            'fixed_cases': overall_result['fixed_cases'] if overall_result else 0,
            'percentage_fixed': round(overall_result['percentage_fixed'], 1) if overall_result and overall_result['percentage_fixed'] else 0
        }
        
        conn.close()
        
        return jsonify({
            'diagnosticStats': stats,
            'overallStats': overall_stats
        })
        
    except Exception as e:
        logger.error(f"Error getting diagnostic stats: {str(e)}")
        return jsonify({'error': str(e)}), 500
    



@app.route('/api/question-stats', methods=['POST'])
def get_question_stats():
    """Get statistics for how often YES answers lead to correct diagnosis"""
    try:
        data = request.get_json()
        question_ids = data.get('questionIds', [])
        final_error_id = data.get('finalErrorId')
        
        if not question_ids or not final_error_id:
            return jsonify({"error": "Missing required parameters"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        question_stats = {}
        
        for question_id in question_ids:
            # Query to get stats for this question when answered YES
            yes_query = """
                SELECT 
                    COUNT(*) as total_yes,
                    SUM(CASE WHEN problem_fixed = 1 THEN 1 ELSE 0 END) as yes_fixed,
                    AVG(CASE WHEN problem_fixed = 1 THEN 1.0 ELSE 0.0 END) * 100 as yes_success_rate
                FROM diagnostic_sessions
                WHERE final_error_id = ?
                AND json_extract(questions_answered, '$."' || ? || '"') = 1
            """
            
            cursor.execute(yes_query, (final_error_id, str(question_id)))
            yes_result = cursor.fetchone()
            
            # Query to count NO answers (just for information, not success rate)
            no_query = """
                SELECT COUNT(*) as total_no
                FROM diagnostic_sessions
                WHERE final_error_id = ?
                AND json_extract(questions_answered, '$."' || ? || '"') = 0
            """
            
            cursor.execute(no_query, (final_error_id, str(question_id)))
            no_result = cursor.fetchone()
            
            # Calculate how often this question is answered YES in successful diagnoses
            relevance_query = """
                SELECT 
                    COUNT(CASE WHEN json_extract(questions_answered, '$."' || ? || '"') = 1 THEN 1 END) as yes_in_success,
                    COUNT(*) as total_success
                FROM diagnostic_sessions
                WHERE final_error_id = ?
                AND problem_fixed = 1
            """
            
            cursor.execute(relevance_query, (str(question_id), final_error_id))
            relevance_result = cursor.fetchone()
            
            question_stats[question_id] = {
                'yes_stats': {
                    'total': yes_result['total_yes'] if yes_result else 0,
                    'fixed': yes_result['yes_fixed'] if yes_result else 0,
                    'success_rate': round(yes_result['yes_success_rate'], 1) if yes_result and yes_result['yes_success_rate'] else 0
                },
                'no_count': no_result['total_no'] if no_result else 0,
                'relevance_rate': round((relevance_result['yes_in_success'] / relevance_result['total_success'] * 100) 
                                      if relevance_result and relevance_result['total_success'] > 0 else 0, 1)
            }
        
        conn.close()
        return jsonify(question_stats)
        
    except Exception as e:
        logger.error(f"Error getting question stats: {str(e)}")
        return jsonify({'error': str(e)}), 500#!/usr/bin/env python3
    

# --- Global error handler ---------------------------------------------------
@app.errorhandler(Exception)
def handle_error(e):
    logger.error("Unhandled error:\n%s", traceback.format_exc())
    return jsonify(detail=str(e), type=e.__class__.__name__), 500



if __name__ == '__main__':
    print(f"Server running on http://localhost:3001")
    print(f"Connected to database: {DATABASE_PATH}")
    
    # Test database connection
    try:
        conn = get_db_connection()
        conn.close()
        print("Database connection successful")
    except Exception as e:
        print(f"Database connection failed: {e}")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=3001, debug=True)