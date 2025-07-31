from backend.app.models.root_cause import RootCause
from datetime import datetime
from backend.app import db

# test get

def test_get_all(client):
    root_cause1 = RootCause(root_cause='root cause 1', created_at=datetime.now(), updated_at=datetime.now())
    root_cause2 = RootCause(root_cause='root cause 2', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(root_cause1)
    db.session.add(root_cause2)
    db.session.commit()

    response = client.get('/admin/root-causes')
    assert  (response.get_json()[1]['id'] == root_cause2.id)

def test_get_one(client):
    root_cause1 = RootCause(root_cause='root cause 1', created_at=datetime.now(), updated_at=datetime.now())
    root_cause2 = RootCause(root_cause='root cause 2', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(root_cause1)
    db.session.add(root_cause2)
    db.session.commit()

    response = client.get(f'/admin/root-causes/{root_cause2.id}')
    assert  (response.get_json()['id'] == root_cause2.id)


# test add

def test_add_question_success(client):
    payload = {'root_cause': 'a root cause'}

    response = client.post('/admin/root-causes', json=payload)

    assert  (response.status_code == 201)
    assert  ('id' in response.get_json())
    assert  (response.get_json()['root_cause'] == 'a root cause')

def test_add_question_missing_field(client):
    payload = {}
    response = client.post('/admin/questions', json=payload)

    assert  response.status_code == 400
    

# test delete

def test_delete_succesful(client): 
    root_cause = RootCause(root_cause='root cause', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(root_cause)
    db.session.commit()

    assert  RootCause.query.count() == 1

    response = client.delete(f'/admin/root-causes/{root_cause.id}')

    assert  response.status_code == 200
    assert  RootCause.query.count() == 0

# test modify

def test_modify_question(client):
    root_cause = RootCause(root_cause='some root cause', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(root_cause)
    db.session.commit()

    response = client.put(f'/admin/root-causes/{root_cause.id}', json={'root_cause': 'a different root cause'})

    assert  response.get_json()['root_cause'] == 'a different root cause'