from backend.app import db

class Question(db.Model):
    __tablename__ = "Question"

    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=True)
    help_text_link = db.Column(db.Text, nullable=True)
    help_image_link = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        print(f"<Question {self.id}>")

