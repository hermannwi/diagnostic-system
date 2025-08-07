from .. import db
from .product import Product

class Part(db.Model):
    __tablename__ = 'part'

    id = db.Column(db.Integer, primary_key=True)
    part = db.Column(db.VARCHAR, nullable=False, unique=True)
    product_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    __table_args__ = (
        db.ForeignKeyConstraint([product_id], [Product.id]),
        db.UniqueConstraint('part', name='uq_part_part'),
    )

    def __repr__(self):
        return f'<Part {self.id}>'