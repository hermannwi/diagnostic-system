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
    print(response.get_json())

def test_get_one(client):
    question1 = Question(question='question1', created_at=datetime.now(), updated_at=datetime.now())
    question2 = Question(question='question2', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(question1)
    db.session.add(question2)
    db.session.commit()

    response = client.get(f'/admin/questions/{question2.id}')
    
    assert  (response.get_json()['id'] == question2.id)

# test add


# test delete

# test modify