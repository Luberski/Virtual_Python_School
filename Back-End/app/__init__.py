from dotenv import load_dotenv

load_dotenv()
from .routes import *
from .application import application as app

app.register_blueprint(routes)


if __name__ == "__main__":
    app.run()
