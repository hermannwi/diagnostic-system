from .. import db
from .root_cause import RootCause
from .product import Product

class Diagnostics8d(db.Model):
    __tablename__ = "diagnostics_8d"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    from_sn = db.Column(db.VARCHAR, nullable = True) 
    to_sn  = db.Column(db.VARCHAR, nullable = True)
    from_version  = db.Column(db.VARCHAR, nullable = True)
    to_version  = db.Column(db.VARCHAR, nullable = True)
    from_supply_date  = db.Column(db.VARCHAR, nullable = True)
    to_supply_date  = db.Column(db.VARCHAR, nullable = True)
    from_sw  = db.Column(db.VARCHAR, nullable = True)
    to_sw  = db.Column(db.VARCHAR, nullable = True)
    issue  = db.Column(db.Text, nullable=False)
    temporary_fix  = db.Column(db.Text, nullable=True)
    root_cause_id  = db.Column(db.Integer, nullable=True)
    corrective_action  = db.Column(db.Text, nullable=True)
    preventative_action  = db.Column(db.Text, nullable=True)
    verified_fix  = db.Column(db.Text, nullable=True)
    closed = db.Column(db.Boolean, nullable = False)
    link_8d  = db.Column(db.Text, nullable=True)
    created_at  = db.Column(db.DateTime, nullable=False)
    updated_at  = db.Column(db.DateTime, nullable=False)
    
    __table_args__ = (db.ForeignKeyConstraint([root_cause_id], [RootCause.id]),
                      db.ForeignKeyConstraint([product_id], [Product.id], name='fk_diagnostics_8d_product_id'))
    
    product = db.relationship('Product', backref='diagnostic8ds', lazy='select')
    root_cause = db.relationship('RootCause', backref='diagnostic8ds', lazy='select')
    questions = db.relationship('Question', backref='diagnostics_8ds', secondary='diagnostics_8d_question', lazy="select")

    def __repr__(self):
        return f"<Diagnostic {self.id}>"