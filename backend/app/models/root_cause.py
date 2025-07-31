from backend.app import db

class RootCause(db.Model):
    __tablename__ = "root_cause"

    id = db.Column(db.Integer, primary_key=True)
    root_cause = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    questions = db.relationship('Question', backref='root_causes', secondary='root_cause_question', lazy="select")

    def __repr__(self):
        return f"<RootCause {self.id}>"
