from backend.app.models.system_version import SystemVersion
from backend.app import db
from datetime import datetime


def test_init(app):
    with app.app_context():
        count = SystemVersion.query.count()
        print("this is count: ",  str(count))
        assert isinstance(count, int)



def test_insert_one(app):
    with app.app_context():
        initial_count = SystemVersion.query.count()
        insert_one()
        final_count = SystemVersion.query.count()

        print(f"\ninitial count = {initial_count}\nfinal count = {final_count}")
        assert  (final_count > initial_count)

        first_record = SystemVersion.query.first()
        print(f"first record id = {first_record.id}")


def insert_one():
    new_record = SystemVersion(from_sn="gd", to_sn="fdg", from_version="sgss", to_version="sdsg", from_supply_date="fdgfh", to_supply_date="dfgd", from_sw="dfgs", to_sw="dsgseg", created_at=datetime.now(), updated_at=datetime.now())
    db.session.add(new_record)
    db.session.flush()