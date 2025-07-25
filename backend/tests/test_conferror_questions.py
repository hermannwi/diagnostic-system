from backend.app.models.conferror_questions import ConferrorQuestions
from backend.app import db
import pytest
import sqlalchemy


def test_insert(app):
    with app.app_context():

        initial_count = ConferrorQuestions.query.count()
        
        new_conferror_id = 500
        new_conferror_question = 500
        new_record = ConferrorQuestions(conferror_id=new_conferror_id, conferror_question=new_conferror_question)
        db.session.add(new_record)
        db.session.flush()

        final_count = ConferrorQuestions.query.count()
        
        print(f"\ninitial count: {initial_count}\nfinal count: {final_count}")
        assert (final_count > initial_count)
        
        new_last_item_id = (ConferrorQuestions.query.all()[-1].conferror_id, ConferrorQuestions.query.all()[-1].conferror_question)
        previous_last_item_id = ((ConferrorQuestions.query.all()[-2].conferror_id, ConferrorQuestions.query.all()[-2].conferror_question))
        print(f"\nprevious last item id: {previous_last_item_id}\nnew last item id: {new_last_item_id}")

        # does the values of the last item correspond to the values of the added record
        assert (new_last_item_id[0] == new_conferror_id)
        assert (new_last_item_id[1] == new_conferror_question)

        db.session.rollback()
        
        


def test_primary_key(app):
    with app.app_context():

        new_conferror_id = ConferrorQuestions.query.first().conferror_id
        new_conferror_question = ConferrorQuestions.query.first().conferror_question
        new_record = ConferrorQuestions(conferror_id=new_conferror_id, conferror_question=new_conferror_question)

        db.session.add(new_record)
        with pytest.raises(sqlalchemy.exc.IntegrityError) as exc_info:
            db.session.flush()

        print(f"Caught exception: {exc_info.value}")  # Verify capture
        



def test_exists(app):
    
    with app.app_context():

        count = ConferrorQuestions.query.count()
        print("\nthis is count: ",  str(count))
        assert isinstance(count, int) and (count > 0)
        
        first_record = ConferrorQuestions.query.first()
        print(f"this is first record id {first_record.conferror_id} {first_record.conferror_question}")
        if first_record:
           
            assert hasattr(first_record, "conferror_id")
            assert hasattr(first_record, "conferror_question")
            
            
            






