from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object("backend.app.config.Config")

    
    # Allow requests from http://localhost:3000 (React dev server)
    CORS(app)

    db.init_app(app)

    # from app.admin.routes import admin_bp
    # app.register_blueprint(admin_bp, url_prefix="/admin")

    return app