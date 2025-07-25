from backend.app import db



class ConfError(db.Model): 
    __tablename__ = "conf_error"

    id = db.Column(db.Integer, primary_key=True) 
    full_value = db.Column(db.String(100), nullable=False)
    parent = db.Column(db.Integer, nullable=False)
    system = db.Column(db.String, nullable=False)
    part_no = db.Column(db.String, nullable=True)
    d2e_description = db.Column(db.String(500), nullable=True)
    d3e_containment_act = db.Column(db.String(500), nullable=True)
    d4e_root_cause = db.Column(db.String(500), nullable=True)
    d5e_action_performed = db.Column(db.String(500), nullable=True)
    d6e_validate_perm = db.Column(db.String(500), nullable=True)
    d7e_prevent_reoccur = db.Column(db.String(500), nullable=True)

    created_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<ConfError {self.id}>'

    