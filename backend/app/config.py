import os
from dotenv import load_dotenv

load_dotenv("/Users/CDN/Documents/SKIPPER/phpcode and current files/diagnostic-system/backend/.env")

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    def __repr__(self):
        print(f"<Config>")