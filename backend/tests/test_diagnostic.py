from backend.app.models.diagnostics_8d import Diagnostics8d
from backend.app.models.product import Product
from backend.app.models.root_cause import RootCause
from backend.app import db
from datetime import datetime


def test_init(app):
    with app.app_context():
        count = Diagnostics8d.query.count()
        print("this is count: ",  str(count))
        assert isinstance(count, int)


def test_insert_one(app):
    with app.app_context():
        initial_count = Diagnostics8d.query.count()
        insert_one()
        final_count = Diagnostics8d.query.count()

        print(f"\ninitial count = {initial_count}\nfinal count = {final_count}")
        assert  (final_count > initial_count)

        first_record = Diagnostics8d.query.first()
        print(f"first record id = {first_record.id}")

def insert_one():
    
        new_record = Diagnostics8d(product_id=1, issue="some issue", created_at=datetime.now(), updated_at=datetime.now())
        db.session.add(new_record)
        db.session.flush()


def test_backref(app):
    with app.app_context():
        product1 = Product(product='EML200', created_at=datetime.now(), updated_at=datetime.now())
        db.session.add(product1)
        db.session.commit()

        d_8d1 = Diagnostics8d(product_id=product1.id, issue='some issue', created_at=datetime.now(), updated_at=datetime.now())
        d_8d2 = Diagnostics8d(product_id=product1.id, issue='some other issue', created_at=datetime.now(), updated_at=datetime.now())
        db.session.add(d_8d1)
        db.session.add(d_8d2)
        db.session.commit()

        print(db.session.get(Product, product1.id).diagnostic8ds)


def test_relationships(app):
    with app.app_context():
        product1 = Product(product='EML200', created_at=datetime.now(), updated_at=datetime.now())
        root_cause1 = RootCause(root_cause='a root cause', created_at=datetime.now(), updated_at=datetime.now())
        db.session.add(product1)
        db.session.add(root_cause1)
        db.session.commit()

        d_8d1 = Diagnostics8d(product_id=product1.id, issue='some issue', root_cause_id=root_cause1.id, created_at=datetime.now(), updated_at=datetime.now())
        db.session.add(d_8d1)
        db.session.commit()

        assert  (db.session.get(Diagnostics8d, d_8d1.id).product.product == 'EML200')
        assert  (db.session.get(Diagnostics8d, d_8d1.id).root_cause.root_cause == 'a root cause')