from backend.app.models.conf_error import ConfError
import pytest
import sqlalchemy
from backend.app import db


def test_cf_insert(app):
    with app.app_context():

        initial_count = ConfError.query.count()
        
        new_id=200
        new_record = ConfError(id= new_id, full_value= "dujhksg", parent= "jyfgj", system="EML-speed-log")
        db.session.add(new_record)
        db.session.flush()

        final_count = ConfError.query.count()
        
        print(f"\ninitial count: {initial_count}\nfinal count: {final_count}")
        assert (final_count > initial_count)
        
        new_last_item_id = ConfError.query.all()[-1].id
        previous_last_item_id = ConfError.query.all()[-2].id
        print(f"\nprevious last item id: {previous_last_item_id}\nnew last item id: {new_last_item_id}")
        assert (new_last_item_id == new_id)

        db.session.rollback()


def test_primary_key(app):
    with app.app_context():

        new_id=1
        new_record = ConfError(id= new_id, full_value= "dujhksg", parent= "jyfgj", system="EML-speed-log")
        
        db.session.add(new_record)
        with pytest.raises(sqlalchemy.exc.IntegrityError) as exc_info:
            db.session.flush()

        print(f"Caught exception: {exc_info.value}")  # Verify capture


def test_conferror_exists(app):
    
    with app.app_context():

        count = ConfError.query.count()
        print("this is count: ",  str(count))
        assert isinstance(count, int)
        
        first_record = ConfError.query.first()
        print(f"this is first record id {first_record.id}")
        if first_record:
           
            
            assert hasattr(first_record, "created_at")
            assert first_record.id == 1




