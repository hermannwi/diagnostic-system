

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:////Users/CDN/Documents/SKIPPER/main_project/diagnostic-system/backend/diagn_sys_db.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    def __repr__(self):
        print(f"<Config>")