from backend.app import db

class SystemVersion(db.Model):
    __tablename__ = "system_version"

    id = db.Column(db.Integer, primary_key=True)
    from_sn = db.Column(db.VARCHAR, nullable = False)
    to_sn  = db.Column(db.VARCHAR, nullable = False)
    from_version  = db.Column(db.VARCHAR, nullable = False)
    to_version  = db.Column(db.VARCHAR, nullable = False)
    from_supply_date  = db.Column(db.VARCHAR, nullable = False)
    to_supply_date  = db.Column(db.VARCHAR, nullable = False)
    from_sw  = db.Column(db.VARCHAR, nullable = False)
    to_sw  = db.Column(db.VARCHAR, nullable = False)