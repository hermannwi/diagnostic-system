from .. import db

class System(db.Model):
    __tablename__ = 'system'

    id = db.Column(db.Integer, primary_key=True)
    system = db.Column(db.VARCHAR, nullable=False, unique=True)
    created_at = db.Column(db.DateTime, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('system', name='uq_system_system'),
    )

    products = db.relationship('Product', backref='system', lazy="select")

    def __repr__(self):
        return f'<System {self.id}>'