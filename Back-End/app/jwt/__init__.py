from flask_jwt_extended import JWTManager
from app.application import application as app

app.config["JWT_SECRET_KEY"] = "super-secret"
app.config['JWT_BLACKLIST_ENABLED'] = True
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']

jwt = JWTManager(app)
