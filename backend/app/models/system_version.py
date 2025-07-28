from backend.app import db

class SystemVersion(db.Model):
    __tablename__ = "system_version"

    id = db.Column(db.Integer, primary_key=True)
    from_sn = db.Column(db.VARCHAR, nullable = True) 
    to_sn  = db.Column(db.VARCHAR, nullable = True)
    from_version  = db.Column(db.VARCHAR, nullable = True)
    to_version  = db.Column(db.VARCHAR, nullable = True)
    from_supply_date  = db.Column(db.VARCHAR, nullable = True)
    to_supply_date  = db.Column(db.VARCHAR, nullable = True)
    from_sw  = db.Column(db.VARCHAR, nullable = True)
    to_sw  = db.Column(db.VARCHAR, nullable = True)

    created_at = db.Column(db.DATETIME, nullable = False)
    updated_at = db.Column(db.DATETIME, nullable = False)