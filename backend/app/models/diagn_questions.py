from backend.app import db

class DiagnQuestions(db.Model):
    __tablename__ = "diagn_questions"

    id = db.Column(db.Integer, primary_key=True)
    system = db.Column(db.String(100), nullable=False)
    question = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    help_text_link = db.Column(db.String, nullable=True)
    help_image_link = db.Column(db.String, nullable=True)
    
    created_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"<DiagnQuestions {self.id}>"

