from backend.app.models.root_cause import RootCause
from backend.app import db
from datetime import datetime


def test_init(app):
    with app.app_context():
        count = RootCause.query.count()
        print("this is count: ",  str(count))
        assert isinstance(count, int)



def test_insert_one(app):
    with app.app_context():
        initial_count = RootCause.query.count()
        insert_one()
        final_count = RootCause.query.count()

        print(f"\ninitial count = {initial_count}\nfinal count = {final_count}")
        assert  (final_count > initial_count)

        first_record = RootCause.query.first()
        print(f"first record id = {first_record.id}")


def insert_one():
    new_record = RootCause(root_cause="this is a root cause", created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(new_record)
    db.session.flush()