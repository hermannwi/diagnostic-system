from backend.app import db
from backend.app.models.root_cause import RootCause

class Diagnostics8d(db.Model):
    __tablename__ = "diagnostics_8d"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    system_version_id  = db.Column(db.Integer, nullable=False)
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
    root_cause_id  = db.Column(db.Text, nullable=True)
    corrective_action  = db.Column(db.Text, nullable=True)
    preventative_action  = db.Column(db.Text, nullable=True)
    verified_fix  = db.Column(db.Text, nullable=True)
    closed = db.Column(db.Boolean, nullable = True)
    link_8d  = db.Column(db.Text, nullable=True)
    created_at  = db.Column(db.DateTime, nullable=False)
    updated_at  = db.Column(db.DateTime, nullable=False)
    
    __table_args__ = (db.ForeignKeyConstraint([root_cause_id], [RootCause.id]), )

    def __repr__(self):
        print(f"<Diagnostic {self.id}>")