from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from passlib.hash import bcrypt_sha256
from app.db.session import Base


class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True)
    zut_id = Column(String(255), unique=True)
    username = Column(String(100), unique=True)
    password = Column(String(100))
    name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(100), unique=True)
    id_course = relationship("CoursesTaken")
    role_id = Column(Integer, ForeignKey("roles.id"))

    @staticmethod
    def generate_hash(password):
        return bcrypt_sha256.hash(password)

    @staticmethod
    def verify_hash(password, hash_):
        return bcrypt_sha256.verify(password, hash_)


class CoursesTaken(Base):
    __tablename__ = "courses_taken"
    id = Column(Integer, primary_key=True)
    id_course = Column(Integer, ForeignKey("courses.id"))
    id_user = Column(Integer, ForeignKey("user.id"))
    start_date = Column(DateTime())
    end_date = Column(DateTime())
    section_number = Column(Integer)
    completed = Column(String(100))
    course = relationship("Courses")


class Courses(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    description = Column(String(2000))
    featured = Column(Boolean, default=False, nullable=False)
    lessons = relationship("Lessons", lazy="dynamic")


class Lessons(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    description = Column(String(2000))
    id_course = Column(Integer, ForeignKey("courses.id"))
    type = Column(Integer)
    number_of_answers = Column(Integer)
    answers = relationship("Answers")


class Answers(Base):
    __tablename__ = "answers"
    id = Column(Integer, primary_key=True)
    final_answer = Column(String(500))
    id_lesson = Column(Integer, ForeignKey("lessons.id"))


class Roles(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    role_name = Column(String(100), unique=True)
    user = relationship("User")
