from .. import db

class Product(db.Model):
    __tablename__ = "product"

    id = db.Column(db.Integer, primary_key=True)
    product = db.Column(db.Text, nullable=False, unique=True)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('product', name='uq_product_product'),
    )

    questions = db.relationship('Question', backref='products', secondary='product_question', lazy="select")


    def __repr__(self):
        return f"<Product {self.id}>"