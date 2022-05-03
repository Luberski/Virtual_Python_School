from sqlalchemy import ForeignKey
from passlib.hash import pbkdf2_sha256 as sha256
from app.db import db


class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    zut_id = db.Column(db.String(255), unique=True)
    username = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    id_course = db.relationship("CoursesTaken")
    role_id = db.Column(db.Integer, ForeignKey("roles.id"))

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
    start_date = db.Column(db.DateTime())
    end_date = db.Column(db.DateTime())
    section_number = db.Column(db.Integer)
    completed = db.Column(db.String(100))
    course = db.relationship("Courses")

    def add(self):
        db.session.add(self)
        db.session.commit()


class Courses(db.Model):
    __tablename__ = "courses"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    description = db.Column(db.String(500))
    featured = db.Column(db.Boolean, default=False, nullable=False)
    users_info = db.relationship("CoursesTaken")
    lessions_info = db.relationship("Lessons")

    def add(self):
        db.session.add(self)
        db.session.commit()


class Lessons(db.Model):
    __tablename__ = "lessons"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    description = db.Column(db.String(500))
    id_course = db.Column(db.Integer, ForeignKey("courses.id"))
    type = db.Column(db.Integer)
    number_of_answers = db.Column(db.Integer)
    answers_info = db.relationship("Answers")
    comments_info = db.relationship("Comments")

    def add(self):
        db.session.add(self)
        db.session.commit()


class Answers(db.Model):
    __tablename__ = "answers"
    id = db.Column(db.Integer, primary_key=True)
    final_answer = db.Column(db.String(500))
    id_lesson = db.Column(db.Integer, ForeignKey("lessons.id"))

    def add(self):
        db.session.add(self)
        db.session.commit()


class Comments(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    id_lesson = db.Column(db.Integer, ForeignKey("lessons.id"))
    data_published = db.Column(db.DateTime())
    content = db.Column(db.String(500))

    def add(self):
        db.session.add(self)
        db.session.commit()


class Roles(db.Model):
    __tablename__ = "roles"
    id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(100), unique=True)
    user_info = db.relationship("User")

    def add(self):
        db.session.add(self)
        db.session.commit()
