from backend.app.models.product import Product
from backend.app.models.diagnostics_8d import Diagnostics8d
from datetime import datetime
from backend.app import db

# test get

def test_get_all(client):
    product1 = Product(product='EML200', created_at=datetime.now(), updated_at=datetime.now())
    product2 = Product(product='EML100', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(product1)
    db.session.add(product2)
    db.session.commit()

    retrieved_products = client.get('/admin/products')

    print(f'response: {retrieved_products.get_json()}')


def test_get_one(client):
    product = Product(product='EML200', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(product)
    db.session.commit()

    retrieved_product = client.get('/admin/products')
    print(f'response: {retrieved_product.get_json()}')
    assert  (retrieved_product.get_json()[0]['id'] == 1)
    assert  (retrieved_product.get_json()[0]['product'] == 'EML200')


# test add

def test_add_product_success(client):
    payload = {'product': 'EML100'}

    response = client.post('/admin/products', json=payload)

    assert  (response.status_code == 201)
    assert  ('id' in response.get_json())
    assert  (response.get_json()['product'] == 'EML100')



def test_add_product_missing_field(client):
    response = client.post("/admin/products", json={})
    print(response.get_json()['error'])
    assert response.status_code == 400

def test_add_product_unique_constraint(client):
    product = Product(product='EML100', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(product)
    db.session.commit()
    payload = {'product': 'EML100'}

    response = client.post('/admin/products', json=payload)

    assert  (response.status_code == 409)


# test delete

def test_delete_question_existing_record(client):
    product = Product(product='EML100', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(product)
    db.session.commit()

    assert  Product.query.count() == 1

    response = client.delete(f'/admin/products/{product.id}')

    assert  response.status_code == 200
    assert  Product.query.count() == 0

# test modify

def test_modify_product(client):
    product = Product(product='EML100', created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(product)
    db.session.commit()

    response = client.put(f'/admin/products/{product.id}', json={'product': 'DSL100'})

    assert  response.get_json()['product'] == 'DSL100'









