from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
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
    course_id = relationship("EnrolledCourses")
    role_id = Column(Integer, ForeignKey("roles.id"))

    @staticmethod
    def generate_hash(password):
        return bcrypt_sha256.hash(password)

    @staticmethod
    def verify_hash(password, hash_):
        return bcrypt_sha256.verify(password, hash_)


class EnrolledCourses(Base):
    __tablename__ = "enrolled_courses"
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("user.id"))
    start_date = Column(DateTime())
    end_date = Column(DateTime())
    completed = Column(Boolean, default=False, nullable=False)
    course = relationship("Courses")
    enrolled_lessons = relationship(
        "EnrolledLessons", cascade="all, delete", passive_deletes=True
    )


class Courses(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    description = Column(Text)
    featured = Column(Boolean, default=False, nullable=False)
    lessons = relationship("Lessons", lazy="dynamic", cascade="all, delete")
    # ISO 639-1 Letter Language Codes
    lang = Column(String(2), default="en")
    tags = relationship("CourseTags", lazy="dynamic", cascade="all, delete")


class CourseTags(Base):
    __tablename__ = "course_tags"
    id = Column(Integer, primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    name = Column(String(100), nullable=False)


class Lessons(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    description = Column(Text)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    type = Column(Integer)
    number_of_answers = Column(Integer)
    answers = relationship("Answers", cascade="all, delete")


class EnrolledLessons(Base):
    __tablename__ = "enrolled_lessons"
    id = Column(Integer, primary_key=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"))
    enrolled_course_id = Column(
        Integer, ForeignKey("enrolled_courses.id", ondelete="CASCADE")
    )
    user_id = Column(Integer, ForeignKey("user.id"))
    start_date = Column(DateTime())
    end_date = Column(DateTime())
    completed = Column(Boolean, default=False, nullable=False)
    lesson = relationship("Lessons")


class Answers(Base):
    __tablename__ = "answers"
    id = Column(Integer, primary_key=True)
    final_answer = Column(String(500))
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"))
    answer_check_rule = Column(String(50), default="equal")


class AnswersHistory(Base):
    __tablename__ = "answers_history"
    id = Column(Integer, primary_key=True)
    answer_id = Column(Integer, ForeignKey("answers.id", ondelete="CASCADE"))
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("user.id"))
    answer = Column(String(500))
    is_correct = Column(Boolean, default=False, nullable=False)
    date = Column(DateTime())


class Roles(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    role_name = Column(String(100), unique=True)
    user = relationship("User")


class DynamicCourseSurveyUserResults(Base):
    __tablename__ = "dynamic_course_survey_user_results"
    id = Column(Integer, primary_key=True)
    survey_id = Column(
        Integer, ForeignKey("dynamic_course_survey.id", ondelete="CASCADE")
    )
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"))
    question_id = Column(
        Integer, ForeignKey("dynamic_course_survey_questions.id", ondelete="CASCADE")
    )
    answer_id = Column(
        Integer, ForeignKey("dynamic_course_survey_answers.id", ondelete="CASCADE")
    )
    survey = relationship("DynamicCourseSurvey")


class DynamicCourseSurveyAnswers(Base):
    __tablename__ = "dynamic_course_survey_answers"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    question_id = Column(
        Integer, ForeignKey("dynamic_course_survey_questions.id", ondelete="CASCADE")
    )
    rule_type = Column(Integer)
    rule_value = Column(Integer)


class DynamicCourseSurveyQuestions(Base):
    __tablename__ = "dynamic_course_survey_questions"
    id = Column(Integer, primary_key=True)
    survey_id = Column(
        Integer, ForeignKey("dynamic_course_survey.id", ondelete="CASCADE")
    )
    question = Column(String(500))
    answers = relationship(
        "DynamicCourseSurveyAnswers", cascade="all, delete", passive_deletes=True
    )


class DynamicCourseSurvey(Base):
    __tablename__ = "dynamic_course_survey"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    questions = relationship(
        "DynamicCourseSurveyQuestions",
        cascade="all, delete",
        passive_deletes=True,
    )
    featured = Column(Boolean, default=False, nullable=False)


class DynamicLessons(Base):
    __tablename__ = "dynamic_lessons"
    id = Column(Integer, primary_key=True)
    dynamic_course_id = Column(Integer, ForeignKey("dynamic_courses.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    completed = Column(Boolean, default=False, nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"))
    start_date = Column(DateTime())
    end_date = Column(DateTime())


class DynamicCourses(Base):
    __tablename__ = "dynamic_courses"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    user_id = Column(Integer, ForeignKey("user.id"))
    dynamic_lessons = relationship(
        "DynamicLessons", lazy="dynamic", cascade="all, delete", passive_deletes=True
    )


class KnowledgeTestQuestions(Base):
    __tablename__ = "knowledge_test_questions"
    id = Column(Integer, primary_key=True)
    question = Column(String(500))
    answer = Column(String(500))
    knowledge_test_id = Column(
        Integer, ForeignKey("knowledge_test.id", ondelete="CASCADE")
    )


class KnowledgeTest(Base):
    __tablename__ = "knowledge_test"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    questions = relationship(
        "KnowledgeTestQuestions",
        lazy="dynamic",
        cascade="all, delete",
        passive_deletes=True,
    )


class KnowledgeTestUserResults(Base):
    __tablename__ = "knowledge_test_user_results"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    knowledge_test_id = Column(
        Integer, ForeignKey("knowledge_test.id", ondelete="CASCADE")
    )
    question_id = Column(
        Integer, ForeignKey("knowledge_test_questions.id", ondelete="CASCADE")
    )
    answer = Column(String(500))
    is_correct = Column(Boolean, default=False, nullable=False)


class GlobalKnowledgeTest(Base):
    __tablename__ = "global_knowledge_test"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    questions = relationship(
        "GlobalKnowledgeTestQuestions",
        lazy="dynamic",
        cascade="all, delete",
        passive_deletes=True,
    )


class GlobalKnowledgeTestQuestions(Base):
    __tablename__ = "global_knowledge_test_questions"
    id = Column(Integer, primary_key=True)
    question = Column(String(500))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    answer = Column(String(500))
    global_knowledge_test_id = Column(
        Integer, ForeignKey("global_knowledge_test.id", ondelete="CASCADE")
    )


class GlobalKnowledgeTestUserResults(Base):
    __tablename__ = "global_knowledge_test_user_results"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    global_knowledge_test_id = Column(
        Integer, ForeignKey("global_knowledge_test.id", ondelete="CASCADE")
    )
    question_id = Column(
        Integer, ForeignKey("global_knowledge_test_questions.id", ondelete="CASCADE")
    )
    answer = Column(String(500))
    is_correct = Column(Boolean, default=False, nullable=False)
