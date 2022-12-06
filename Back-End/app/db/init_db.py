from sqlalchemy.orm import Session

# pylint: disable=W0611,E0611
from app.db.session import Base
from app.models import (
    User,
    EnrolledCourses,
    Roles,
    Courses,
    Lessons,
    Answers,
    EnrolledLessons,
    DynamicCourseSurvey,
    DynamicCourseSurveyQuestions,
    DynamicCourseSurveyAnswers,
    DynamicCourseSurveyUserResults,
    DynamicCourses,
    DynamicLessons,
    CourseTags,
    KnowledgeTest,
    KnowledgeTestQuestions,
    KnowledgeTestUserResults,
    GlobalKnowledgeTest,
    GlobalKnowledgeTestQuestions,
    GlobalKnowledgeTestUserResults,
)


def init_db(db: Session) -> None:
    db.create_all()
    db.session.commit()
