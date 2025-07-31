from backend.app import db

class RootCause(db.Model):
    __tablename__ = "root_cause"

    id = db.Column(db.Integer, primary_key=True)
    root_cause = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f"<RootCause {self.id}>"
