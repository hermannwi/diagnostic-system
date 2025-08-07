from .. import db
from .system import System


class Product(db.Model):
    __tablename__ = "product"

    id = db.Column(db.Integer, primary_key=True)
    product = db.Column(db.Text, nullable=False, unique=True)
    system_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    __table_args__ = (
        db.ForeignKeyConstraint([system_id], [System.id]),
        db.UniqueConstraint('product', name='uq_product_product'),
    )

    questions = db.relationship('Question', backref='products', secondary='product_question', lazy="select")
    parts = db.relationship('Part', backref='product', lazy='select')


    def __repr__(self):
        return f"<Product {self.id}>"