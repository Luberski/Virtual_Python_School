from sqlalchemy.orm import Session

# pylint: disable=W0611,E0611
from app.db.session import Base
from app.models import (
    User,
    CoursesTaken,
    Roles,
    Courses,
    Lessons,
    Answers,
)


def init_db(db: Session) -> None:
    db.create_all()
    db.session.commit()
