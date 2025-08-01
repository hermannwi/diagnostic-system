from .. import db
from .root_cause import RootCause
from .question import Question

class RootCauseQuestion(db.Model):
    __tablename__ = "root_cause_question"

    root_cause_id = db.Column(db.Integer)
    question_id = db.Column(db.Integer)

    __table_args__ = (
        db.PrimaryKeyConstraint(root_cause_id, question_id),
        db.ForeignKeyConstraint([root_cause_id],[RootCause.id]),
        db.ForeignKeyConstraint([question_id],[Question.id])
    )

    