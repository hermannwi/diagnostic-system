import pytest
from backend.app import create_app, db
import os
from sqlalchemy.orm import sessionmaker

@pytest.fixture
def app():
    os.environ['DATABASE_URL'] = 'sqlite:////Users/CDN/Documents/SKIPPER/phpcode and current files/diagnostic-system/backend/test_db2_copy.db'
    app = create_app()
    app.config["TESTING"] = True
    

    with app.app_context():

        

        Session = sessionmaker(db.engine)

        with db.engine.connect() as connection:
            with Session(bind=connection) as session:
                db.session.begin_nested()
                yield app
                db.session.rollback()



@pytest.fixture
def client(app):
    return app.test_client()