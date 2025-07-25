from backend.app import db
from backend.app.models.conf_error import ConfError
from backend.app.models.init_diagn import InitDiagn

class SearchTable(db.Model):
    __tablename__ = "search_table"

    conferror_id = db.Column(db.Integer, nullable=False)
    init_diagn_id = db.Column(db.Integer, nullable=False)
    cnt = db.Column(db.Integer, default=1)
    
    created_at = db.Column(db.DateTime, nullable=True)

    __table_args__ = (
        db.PrimaryKeyConstraint(conferror_id, init_diagn_id),
        db.ForeignKeyConstraint([conferror_id], [ConfError.id]),
        db.ForeignKeyConstraint([init_diagn_id], [InitDiagn.id])
    )

    def __repr_(self):
        print(f"<SearchTable {self.conferror_id} {self.init_diagn_id}>")

