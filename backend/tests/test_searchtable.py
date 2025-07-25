from backend.app.models.search_table import SearchTable
from backend.app import db
import pytest
import sqlalchemy


def test_initdiagn_insert(app):
    with app.app_context():

        initial_count = SearchTable.query.count()
        
        new_conferror_id = 500
        new_init_diagn_id = 500
        new_record = SearchTable(conferror_id=new_conferror_id, init_diagn_id=new_init_diagn_id)
        db.session.add(new_record)
        db.session.flush()

        final_count = SearchTable.query.count()
        
        print(f"\ninitial count: {initial_count}\nfinal count: {final_count}")
        assert (final_count > initial_count)
        
        new_last_item_id = (SearchTable.query.all()[-1].conferror_id, SearchTable.query.all()[-1].init_diagn_id)
        previous_last_item_id = ((SearchTable.query.all()[-2].conferror_id, SearchTable.query.all()[-2].init_diagn_id))
        print(f"\nprevious last item id: {previous_last_item_id}\nnew last item id: {new_last_item_id}")

        # does the values of the last item correspond to the values of the added record
        assert (new_last_item_id[0] == new_conferror_id)
        assert (new_last_item_id[1] == new_init_diagn_id)

        # since a new record should by default get 1, the last added record should have cnt == 1
        assert(SearchTable.query.all()[-1].cnt == 1)

        db.session.rollback()
        


def test_primary_key(app):
    with app.app_context():

        new_conferror_id = SearchTable.query.first().conferror_id
        new_init_diagn_id = SearchTable.query.first().init_diagn_id
        new_record = SearchTable(conferror_id=new_conferror_id, init_diagn_id=new_init_diagn_id)
        db.session.add(new_record)
        with pytest.raises(sqlalchemy.exc.IntegrityError) as exc_info:
            db.session.flush()

        print(f"Caught exception: {exc_info.value}")  # Verify capture
        



def test_initdiagn_exists(app):
    
    with app.app_context():

        count = SearchTable.query.count()
        print("\nthis is count: ",  str(count))
        assert isinstance(count, int) and (count > 0)
        
        first_record = SearchTable.query.first()
        print(f"this is first record id {first_record.conferror_id} {first_record.init_diagn_id}")
        if first_record:
           
            assert hasattr(first_record, "conferror_id")
            assert hasattr(first_record, "init_diagn_id")
            assert hasattr(first_record, "cnt")
            
            






