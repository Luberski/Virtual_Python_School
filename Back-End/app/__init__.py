import os
from dotenv import load_dotenv
from .routes import *
from .application import application as app

load_dotenv()
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
app.register_blueprint(routes)


if __name__ == "__main__":
    app.run()
