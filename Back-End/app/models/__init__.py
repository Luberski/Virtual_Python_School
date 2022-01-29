from app.db import db
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from passlib.hash import pbkdf2_sha256 as sha256


class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    zut_id = db.Column(db.String(255), unique=True)
    username = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    id_course = relationship("Courses_taken")

    @staticmethod
    def generate_hash(password):
        return sha256.hash(password)

    @staticmethod
    def verify_hash(password, hash_):
        return sha256.verify(password, hash_)


class RevokedTokenModel(db.Model):
    __tablename__ = "revoked_tokens"
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(120))

    def add(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def is_jti_blacklisted(cls, jti):
        query = cls.query.filter_by(jti=jti).first()
        return bool(query)


class CoursesTaken(db.Model):
    __tablename__ = "courses_taken"
    id = db.Column(db.Integer, primary_key=True)
    id_course = db.Column(db.Integer, ForeignKey("courses.id"))
    id_user = db.Column(db.Integer, ForeignKey("user.id"))
    start_date = db.Column(db.Date())
    end_date = db.Column(db.Date())
    section_number = db.Column(db.Integer)
    completed = db.Column(db.String(100))

    def add(self):
        db.session.add(self)
        db.session.commit()


class Courses(db.Model):
    __tablename__ = "courses"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    description = db.Column(db.String(500))
    sections = db.Column(db.String(1))
    users_info = relationship("courses_taken")

    def add(self):
        db.session.add(self)
        db.session.commit()
