import pytest
from backend.app import create_app, db
import os
from sqlalchemy.orm import sessionmaker
from backend.app.test_config import TestConfig

@pytest.fixture
def app():
    
    app = create_app(config_class=TestConfig)
    
    with app.app_context():

        db.create_all()
        yield app
        db.drop_all()



@pytest.fixture
def client(app):
    return app.test_client()