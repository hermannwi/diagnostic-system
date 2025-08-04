from backend.app.models.root_cause import RootCause
from backend.app.models.question import Question
from backend.app.models.diagnostics_8d_question import Diagnostics8d
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



# def test_relationship(app):
#     with app.app_context():
#         question1 = Question(question='question1', created_at=datetime.now(), updated_at=datetime.now())
#         question2 = Question(question='question2', created_at=datetime.now(), updated_at=datetime.now())
#         db.session.add(question1)
#         db.session.add(question2)
#         root_cause = RootCause(root_cause='rootcause', created_at=datetime.now(), updated_at=datetime.now())
#         db.session.add(root_cause)
        
#         root_cause.questions.append(question1)
#         root_cause.questions.append(question2)

#         db.session.commit()

#         print(db.session.get(RootCause, root_cause.id).questions)

# def test_backref(app):
#     with app.app_context():

#         question = Question(question='question1', created_at=datetime.now(), updated_at=datetime.now())
        
#         db.session.add(question)
        
#         root_cause1 = RootCause(root_cause='rootcause1', created_at=datetime.now(), updated_at=datetime.now())
#         root_cause2 = RootCause(root_cause='rootcause2', created_at=datetime.now(), updated_at=datetime.now())
#         db.session.add(root_cause1)
#         db.session.add(root_cause2)
#         question.root_causes.append(root_cause1)
#         question.root_causes.append(root_cause2)

#         db.session.commit()

#         print(db.session.get(Question, question.id).root_causes)