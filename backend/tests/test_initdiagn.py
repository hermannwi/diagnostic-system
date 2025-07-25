from backend.app.models.init_diagn import InitDiagn
from backend.app import db
import pytest
import sqlalchemy



def test_initdiagn_insert(app):
    with app.app_context():

        initial_count = InitDiagn.query.count()
        
        new_id = 210
        new_record = InitDiagn(id=new_id, error_type="gsidjgs", full_value= "dujhksg", parent= 5)
        db.session.add(new_record)
        db.session.flush()

        final_count = InitDiagn.query.count()
        
        print(f"\ninitial count: {initial_count}\nfinal count: {final_count}")
        assert (final_count > initial_count)
        
        new_last_item_id = InitDiagn.query.all()[-1].id
        previous_last_item_id = InitDiagn.query.all()[-2].id
        print(f"\nprevious last item id: {previous_last_item_id}\nnew last item id: {new_last_item_id}")
        assert (new_last_item_id == new_id)

        db.session.rollback()


def test_primary_key(app):
    with app.app_context():

        new_id = 1
        new_record = InitDiagn(id=new_id, error_type="gsidjgs", full_value= "dujhksg", parent= 5)
        
        db.session.add(new_record)
        with pytest.raises(sqlalchemy.exc.IntegrityError) as exc_info:
            db.session.flush()

        print(f"Caught exception: {exc_info.value}")  # Verify capture


def test_initdiagn_exists(app):
    
    with app.app_context():

        count = InitDiagn.query.count()
        print("this is count: ",  str(count))
        assert isinstance(count, int)
        
        first_record = InitDiagn.query.first()
        print(f"this is first record id {first_record.id}")
        if first_record:
           
            assert hasattr(first_record, "id")
            assert hasattr(first_record, "error_type")
            assert hasattr(first_record, "full_value")
            assert hasattr(first_record, "parent")
            assert hasattr(first_record, "created_at")
            
            assert first_record.id == 1




