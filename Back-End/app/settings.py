# pylint: disable=C0411
from dotenv import load_dotenv

load_dotenv()
import os

PROJECT_NAME = "virtual python school"
VERSION = "1.1.0"
BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API_PREFIX = "/api"

DEBUG = True

JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")

SQLALCHEMY_DATABASE_URL: str = os.getenv("SQLALCHEMY_DATABASE_URI")


ADMIN_ID = 1
