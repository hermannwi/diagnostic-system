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

    

    db.init_app(app)
    migrate = Migrate(app, db)


    from backend.app.models.diagnostics_8d import Diagnostics8d
    from backend.app.models.product import Product
    from backend.app.models.question import Question
    from backend.app.models.root_cause_question import RootCauseQuestion
    from backend.app.models.root_cause import RootCause

    from backend.app.routes.admin_bp import admin_bp
    
    app.register_blueprint(admin_bp)

    

    return app