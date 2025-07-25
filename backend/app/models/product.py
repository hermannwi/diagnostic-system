from backend.app import db

class Product(db.Model):
    __tablename__ = "product"

    id = db.Column(db.Integer, primary_key=True)
    product = db.Column(db.Text, nullable=False)

    def __repr__(self):
        print(f"<Product {self.id}>")