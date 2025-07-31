from backend.app.models.question import Question
from datetime import datetime
from backend.app import db

# test get

def test_get_all(client):
    question1 = Question(question='question1', created_at=datetime.now(), updated_at=datetime.now())
    question2 = Question(question='question2', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(question1)
    db.session.add(question2)
    db.session.commit()

    response = client.get('/admin/questions')
    assert  (response.get_json()[1]['id'] == question2.id)

def test_get_one(client):
    question1 = Question(question='question1', created_at=datetime.now(), updated_at=datetime.now())
    question2 = Question(question='question2', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(question1)
    db.session.add(question2)
    db.session.commit()

    response = client.get(f'/admin/questions/{question2.id}')
    assert  (response.get_json()['id'] == question2.id)


# test add

def test_add_question_success(client):
    payload = {'question': 'a question'}

    response = client.post('/admin/questions', json=payload)

    assert  (response.status_code == 201)
    assert  ('id' in response.get_json())
    assert  (response.get_json()['question'] == 'a question')

def test_add_question_missing_field(client):
    payload = {'description': 'some desc'}
    response = client.post('/admin/questions', json=payload)

    assert  response.status_code == 400
    assert  response.get_json()['error'] == 'Missing required fields'

# test delete

def test_delete_succesful(client): 
    question = Question(question='question1', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(question)
    db.session.commit()

    assert  Question.query.count() == 1

    response = client.delete(f'/admin/questions/{question.id}')

    assert  response.status_code == 200
    assert  Question.query.count() == 0

# test modify

def test_modify_question(client):
    product = Question(question='some question', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(product)
    db.session.commit()

    response = client.put(f'/admin/questions/{product.id}', json={'question': 'a different question'})

    assert  response.get_json()['question'] == 'a different question'