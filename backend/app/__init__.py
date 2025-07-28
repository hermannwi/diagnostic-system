from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from backend.app.config import Config


db = SQLAlchemy()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    
    # Allow requests from http://localhost:3000 (React dev server)
    CORS(app)

    migrate = Migrate(app, db)
    
    db.init_app(app)

    # from app.admin.routes import admin_bp
    # app.register_blueprint(admin_bp, url_prefix="/admin")

    return app