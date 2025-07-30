from backend.app.models.diagnostics_8d import Diagnostics8d
from backend.app.models.product import Product
from backend.app.models.root_cause import RootCause
from datetime import datetime
from backend.app import db

# test get

def test_get_all(app, client):
    product1 = Product(product='EML200', created_at=datetime.now(), updated_at=datetime.now())
    product2 = Product(product='EML100', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(product1)
    db.session.add(product2)
    db.session.commit()

    d_8d1 = Diagnostics8d(product_id=product1.id, issue='some issue', created_at=datetime.now(), updated_at=datetime.now())
    d_8d2 = Diagnostics8d(product_id=product2.id, issue='some other issue', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(d_8d1)
    db.session.add(d_8d2)
    db.session.commit()

    retrieved_8ds = client.get('/admin/diagnostics8ds')

    print(f'response: {retrieved_8ds.get_json()}')



# test add

def test_add_8d_success(app, client):
    product = Product(product='EML100', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(product)
    db.session.commit()

    payload = {
        "product": product.id,
        'issue': 'some issue'
    }

    response = client.post("/admin/diagnostics8ds", json=payload)

    assert  (response.status_code == 201)
    assert  (response.get_json()['message'] == "8D Diagnostic created")
    assert  ('id' in response.get_json())


def test_add_8d_missing_fields(client):
    response = client.post("/admin/diagnostics8ds", json={})
    print(response.get_json()['error'])
    assert response.status_code == 400
    
    
# test delete

def test_delete_record_existing_record(client):

    assert  Diagnostics8d.query.count() == 0

    d_8d = create_8d()
    db.session.add(d_8d)
    db.session.commit()

    assert  Diagnostics8d.query.count() == 1

    response = client.delete(f'/admin/diagnostics8ds/{d_8d.id}')

    assert  Diagnostics8d.query.count() == 0
    assert  response.status_code == 200
    assert  response.get_json()['message'] == 'Record deleted successfully'



def test_delete_nonexistent_record(client):
    response = client.delete(f'/admin/diagnostics8ds/1')

    assert  response.status_code == 404
    assert  (response.get_json()['error']) == 'No records with id 1'
    

# test modify

###


def create_8d():
    product = Product(product='EML100', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(product)
    db.session.commit()
    d_8d = Diagnostics8d(product_id=product.id, issue='some issue', created_at=datetime.now(), updated_at=datetime.now())
    return d_8d