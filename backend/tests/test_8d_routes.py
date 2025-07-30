from backend.app.models.diagnostics_8d import Diagnostics8d
from backend.app.models.product import Product
from backend.app import db



def test_add_8d_success(app, client):
    product = Product(product='EML100')
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