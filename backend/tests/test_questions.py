from backend.app.models.diagn_questions import DiagnQuestions
from backend.app import db
import pytest
import sqlalchemy



def test_initdiagn_insert(app):
    with app.app_context():

        initial_count = DiagnQuestions.query.count()
        
        new_id = 500
        new_record = DiagnQuestions(id=new_id, system="eml speed log", question="what is?")
        db.session.add(new_record)
        db.session.flush()

        final_count = DiagnQuestions.query.count()
        
        print(f"\ninitial count: {initial_count}\nfinal count: {final_count}")
        assert (final_count > initial_count)
        
        new_last_item_id = DiagnQuestions.query.all()[-1].id
        previous_last_item_id = DiagnQuestions.query.all()[-2].id
        print(f"\nprevious last item id: {previous_last_item_id}\nnew last item id: {new_last_item_id}")
        assert (new_last_item_id == new_id)

        db.session.rollback()


def test_primary_key(app):
    with app.app_context():

        new_id = 1
        new_record = DiagnQuestions(id=new_id, system="eml speed log", question="what is?")
        
        db.session.add(new_record)
        with pytest.raises(sqlalchemy.exc.IntegrityError) as exc_info:
            db.session.flush()

        print(f"Caught exception: {exc_info.value}")  # Verify capture


def test_initdiagn_exists(app):
    
    with app.app_context():

        count = DiagnQuestions.query.count()
        print("this is count: ",  str(count))
        assert isinstance(count, int)
        
        first_record = DiagnQuestions.query.first()
        print(f"this is first record id {first_record.id}")
        if first_record:
           
            assert hasattr(first_record, "id")
            assert hasattr(first_record, "system")
            assert hasattr(first_record, "question")
            assert hasattr(first_record, "description")
            assert hasattr(first_record, "help_text_link")
            assert hasattr(first_record, "help_image_link")
            assert hasattr(first_record, "created_at")
            
            assert first_record.id == 1




