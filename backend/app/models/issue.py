from .. import db

class Issue(db.Model):
    __tablename__ = 'issue'

    id = db.Column(db.Integer, primary_key=True)
    issue = db.Column(db.Text, nullable=False, unique=True)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('issue', name='uq_issue_issue'),
    )

    def __repr__(self):
        return f'<Issue {self.id}>'