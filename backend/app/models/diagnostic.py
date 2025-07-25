from backend.app import db

class Diagnostic(db.Model):
    __tablename__ = "Diagnostic"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    system_version_id  = db.Column(db.Integer, nullable=False)
    issue  = db.Column(db.Text, nullable=False)
    temporary_fix  = db.Column(db.Text, nullable=True)
    root_cause  = db.Column(db.Text, nullable=True)
    corrective_action  = db.Column(db.Text, nullable=True)
    preventative_action  = db.Column(db.Text, nullable=True)
    verified_fix  = db.Column(db.Text, nullable=True)
    link_8d  = db.Column(db.Text, nullable=True)
    created_at  = db.Column(db.DateTime, nullable=False)
    updated_at  = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        print(f"<Diagnostic {self.id}>")