from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from .config import Config


db = SQLAlchemy()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    
    # Allow requests from http://localhost:3000 (React dev server)
    CORS(app)

    

    db.init_app(app)
    migrate = Migrate(app, db)


    from .models.diagnostics_8d import Diagnostics8d
    from .models.system import System
    from .models.product import Product
    from .models.part import Part
    from .models.question import Question
    from .models.diagnostics_8d_question import Diagnostics8dQuestion
    from .models.product_question import ProductQuestion
    from .models.root_cause import RootCause
    from.models.issue import Issue
    
    from .routes.admin_bp import admin_bp
    
    app.register_blueprint(admin_bp)

    
    return app