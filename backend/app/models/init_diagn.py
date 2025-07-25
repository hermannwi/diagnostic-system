from backend.app import db 

class InitDiagn(db.Model):
    __tablename__ = "init_diagn"
    id = db.Column(db.Integer, primary_key=True) 
    error_type = db.Column(db.String(100), nullable=False)
    full_value = db.Column(db.Integer, nullable=False)
    parent = db.Column(db.String(100), nullable=False)

    created_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<InitDiagn {self.id}>'