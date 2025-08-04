from .. import db
from .product import Product
from .question import Question


class ProductQuestion(db.Model):
    __tablename__ = 'product_question'

    product_id = db.Column(db.Integer)
    question_id = db.Column(db.Integer)

    __table_args__ = (
        db.PrimaryKeyConstraint(product_id, question_id),
        db.ForeignKeyConstraint([product_id],[Product.id]),
        db.ForeignKeyConstraint([question_id],[Question.id])
    )