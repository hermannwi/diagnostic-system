from .. import db
from .diagnostics_8d import Diagnostics8d
from .question import Question

class Diagnostics8dQuestion(db.Model):
    __tablename__ = "diagnostics_8d_question"

    diagnostics_8d_id = db.Column(db.Integer)
    question_id = db.Column(db.Integer)

    __table_args__ = (
        db.PrimaryKeyConstraint(diagnostics_8d_id, question_id),
        db.ForeignKeyConstraint([diagnostics_8d_id],[Diagnostics8d.id]),
        db.ForeignKeyConstraint([question_id],[Question.id])
    )

    

    

    