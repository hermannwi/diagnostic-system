from backend.app import db
from backend.app.models.conf_error import ConfError
from backend.app.models.diagn_questions import DiagnQuestions

class ConferrorQuestions(db.Model):
    __tablename__ = "conferror_questions"

    conferror_id = db.Column(db.Integer, primary_key=True)
    conferror_question = db.Column(db.Integer, primary_key=True)

    __table_args__ = (
        db.PrimaryKeyConstraint(conferror_id, conferror_question),
        db.ForeignKeyConstraint([conferror_id], [ConfError.id]),
        db.ForeignKeyConstraint([conferror_question], [DiagnQuestions.id])
    )
