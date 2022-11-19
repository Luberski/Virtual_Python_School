from typing import Union
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
from app.schemas.course import (
    EnrolledCoursesAllResponseDataCollection,
)
from app.schemas.course_tag import (
    CourseTagCreateData,
)


def get_all_enrolled_courses(
    db: Session, user: models.User, include_lessons: bool, limit_lessons: int
) -> Union[list, Exception]:
    try:
        courses_response_data: EnrolledCoursesAllResponseDataCollection = (
            EnrolledCoursesAllResponseDataCollection()
        )
        if include_lessons:
            completed_lessons_count_query = (
                db.query(
                    models.EnrolledLessons.id,
                    models.EnrolledLessons.lesson_id,
                    models.EnrolledLessons.user_id,
                    func.count(models.EnrolledLessons.completed).label(
                        "completed_lessons_count"
                    ),
                )
                .filter(
                    models.EnrolledLessons.user_id == user.id,
                    # pylint: disable=C0121
                    models.EnrolledLessons.completed == True,
                )
                .distinct(models.EnrolledLessons.lesson_id)
                .group_by(models.EnrolledLessons.id)
                .all()
            )
            enrolled_courses_with_lessons = (
                db.query(models.EnrolledCourses)
                .filter_by(user_id=user.id)
                .join(
                    models.Courses,
                    models.Courses.id == models.EnrolledCourses.course_id,
                )
                .join(models.Lessons, models.Courses.id == models.Lessons.course_id)
                .all()
            )
            if enrolled_courses_with_lessons:
                for enrolled_course in enrolled_courses_with_lessons:
                    total_lessons_count = 0
                    total_completed_lessons_count = 0
                    for lesson in enrolled_course.course.lessons:
                        total_lessons_count += 1
                        if lesson.id in [
                            lesson_enrolled.lesson_id
                            for lesson_enrolled in completed_lessons_count_query
                            if lesson_enrolled.lesson_id == lesson.id
                        ]:
                            total_completed_lessons_count += 1

                    courses_response_data.append(
                        {
                            "id": enrolled_course.id,
                            "user_id": enrolled_course.user_id,
                            "course_id": enrolled_course.course.id,
                            "name": enrolled_course.course.name,
                            "description": enrolled_course.course.description,
                            "featured": enrolled_course.course.featured,
                            "enrolled": True,
                            "is_dynamic": False,
                            "end_date": str(enrolled_course.end_date),
                            "total_lessons_count": total_lessons_count,
                            "total_completed_lessons_count": total_completed_lessons_count,
                            "lang": enrolled_course.course.lang,
                            "tags": [
                                {
                                    "id": tag.id,
                                    "name": tag.name,
                                    "course_id": tag.course_id,
                                }
                                for tag in enrolled_course.course.tags
                            ],
                            "lessons": [
                                {
                                    "id": lesson.id,
                                    "start_date": str(enrolled_course.start_date),
                                    "name": lesson.name,
                                    "description": lesson.description,
                                    "type": lesson.type,
                                    "number_of_answers": lesson.number_of_answers,
                                }
                                for lesson in enrolled_course.course.lessons.limit(
                                    limit_lessons
                                )
                            ],
                        }
                    )

        else:
            enrolled_courses = (
                db.query(models.EnrolledCourses)
                .filter_by(user_id=user.id)
                .join(
                    models.Courses,
                    models.Courses.id == models.EnrolledCourses.course_id,
                )
                .all()
            )
            if enrolled_courses:
                for enrolled_course in enrolled_courses:
                    courses_response_data.append(
                        {
                            "id": enrolled_course.id,
                            "user_id": enrolled_course.user_id,
                            "course_id": enrolled_course.course.id,
                            "start_date": str(enrolled_course.start_date),
                            "name": enrolled_course.course.name,
                            "description": enrolled_course.course.description,
                            "featured": enrolled_course.course.featured,
                            "enrolled": True,
                            "is_dynamic": False,
                            "end_date": str(enrolled_course.end_date),
                            "lang": enrolled_course.course.lang,
                            "tags": [
                                {
                                    "id": tag.id,
                                    "name": tag.name,
                                    "course_id": tag.course_id,
                                }
                                for tag in enrolled_course.course.tags
                            ],
                        }
                    )

        return courses_response_data.dict()
    except ValueError as err:
        raise err


def get_enrolled_course_by_id(
    db: Session, user: models.User, course_id: int, include_lessons: bool
) -> Union[dict, Exception]:
    try:
        if include_lessons:
            completed_lessons_count_query = (
                db.query(
                    models.EnrolledLessons.id,
                    models.EnrolledLessons.lesson_id,
                    models.EnrolledLessons.user_id,
                    func.count(models.EnrolledLessons.completed).label(
                        "completed_lessons_count"
                    ),
                )
                .filter(
                    models.EnrolledLessons.user_id == user.id,
                    # pylint: disable=C0121
                    models.EnrolledLessons.completed == True,
                )
                .distinct(models.EnrolledLessons.lesson_id)
                .group_by(models.EnrolledLessons.id)
                .all()
            )
            enrolled_course_with_lessons = (
                db.query(
                    models.EnrolledCourses,
                )
                .filter_by(user_id=user.id, course_id=course_id)
                .first()
            )
            if enrolled_course_with_lessons:
                total_lessons_count = 0
                total_completed_lessons_count = 0
                for lesson in enrolled_course_with_lessons.course.lessons:
                    total_lessons_count += 1
                    if lesson.id in [
                        lesson_enrolled.lesson_id
                        for lesson_enrolled in completed_lessons_count_query
                        if lesson_enrolled.lesson_id == lesson.id
                    ]:
                        total_completed_lessons_count += 1

                return dict(
                    {
                        "id": enrolled_course_with_lessons.id,
                        "user_id": enrolled_course_with_lessons.user_id,
                        "course_id": enrolled_course_with_lessons.course_id,
                        "name": enrolled_course_with_lessons.course.name,
                        "description": enrolled_course_with_lessons.course.description,
                        "featured": enrolled_course_with_lessons.course.featured,
                        "enrolled": True,
                        "is_dynamic": False,
                        "start_date": str(enrolled_course_with_lessons.start_date),
                        "end_date": str(enrolled_course_with_lessons.end_date),
                        "total_lessons_count": total_lessons_count,
                        "total_completed_lessons_count": total_completed_lessons_count,
                        "lang": enrolled_course_with_lessons.course.lang,
                        "tags": [
                            {
                                "id": tag.id,
                                "name": tag.name,
                                "course_id": tag.course_id,
                            }
                            for tag in enrolled_course_with_lessons.course.tags
                        ],
                        "lessons": [
                            {
                                "id": lesson.id,
                                "start_date": str(
                                    enrolled_course_with_lessons.start_date
                                ),
                                "end_date": str(enrolled_course_with_lessons.end_date),
                                "name": lesson.name,
                                "description": lesson.description,
                                "type": lesson.type,
                                "number_of_answers": lesson.number_of_answers,
                                "completed": lesson.id
                                in [
                                    lesson_enrolled.lesson_id
                                    for lesson_enrolled in completed_lessons_count_query
                                    if lesson_enrolled.lesson_id == lesson.id
                                ],
                            }
                            for lesson in enrolled_course_with_lessons.course.lessons
                        ],
                    },
                )

            else:
                raise ValueError("Course not found")
        else:
            enrolled_course = (
                db.query(
                    models.EnrolledCourses,
                )
                .filter_by(user_id=user.id, course_id=course_id)
                .join(
                    models.Courses,
                    models.Courses.id == models.EnrolledCourses.course_id,
                )
                .first()
            )
            if enrolled_course:
                return {
                    "id": enrolled_course.id,
                    "user_id": enrolled_course.user_id,
                    "course_id": enrolled_course.course_id,
                    "name": enrolled_course.course.name,
                    "description": enrolled_course.course.description,
                    "featured": enrolled_course.course.featured,
                    "enrolled": True,
                    "is_dynamic": False,
                    "start_date": str(enrolled_course.start_date),
                    "end_date": str(enrolled_course.end_date),
                    "lang": enrolled_course.course.lang,
                    "tags": [
                        {
                            "id": tag.id,
                            "name": tag.name,
                            "course_id": tag.course_id,
                        }
                        for tag in enrolled_course.course.tags
                    ],
                }
            else:
                raise ValueError("Course not found")
    except ValueError as err:
        raise err


def get_total_completed_lessons_count(db: Session, user: models.User) -> int:
    try:
        completed_lessons_count_query = (
            db.query(
                models.EnrolledLessons.id,
                models.EnrolledLessons.lesson_id,
                models.EnrolledLessons.user_id,
                func.count(models.EnrolledLessons.completed).label(
                    "completed_lessons_count"
                ),
            )
            .filter(
                models.EnrolledLessons.user_id == user.id,
                # pylint: disable=C0121
                models.EnrolledLessons.completed == True,
            )
            .distinct(models.EnrolledLessons.lesson_id)
            .group_by(models.EnrolledLessons.id)
            .all()
        )
        total_completed_lessons_count = 0
        for lesson in db.query(models.Lessons).all():
            if lesson.id in [
                lesson_enrolled.lesson_id
                for lesson_enrolled in completed_lessons_count_query
                if lesson_enrolled.lesson_id == lesson.id
            ]:
                total_completed_lessons_count += 1
        return total_completed_lessons_count
    except ValueError as err:
        raise err


def get_total_enrolled_lessons_count(db: Session, user: models.User) -> int:
    try:
        total_enrolled_lessons_count = 0
        total_enrolled_lessons_count = (
            db.query(models.EnrolledLessons).filter_by(user_id=user.id).count()
        )

        return total_enrolled_lessons_count
    except ValueError as err:
        raise err


def create_course_tag(
    db: Session, course_tag_data: CourseTagCreateData
) -> models.CourseTags:
    try:
        if db.query(models.CourseTags).filter_by(name=course_tag_data.name).first():
            raise ValueError("Course tag already exists")
        db_course_tag = models.CourseTags(
            course_id=course_tag_data.course_id, name=course_tag_data.name
        )
        db.add(db_course_tag)
        db.commit()
        db.refresh(db_course_tag)
        return db_course_tag
    except ValueError as err:
        raise err


def get_course_tags(db: Session) -> list[models.CourseTags]:
    try:
        course_tags = db.query(models.CourseTags).all()
        if course_tags:
            return course_tags
        raise ValueError("Course tags not found")
    except ValueError as err:
        raise err


def get_course_tags_by_course_id(
    db: Session, course_id: int
) -> list[models.CourseTags]:
    try:
        course_tags = db.query(models.CourseTags).filter_by(course_id=course_id).all()
        if course_tags:
            return course_tags
        raise ValueError("Course tags not found")
    except ValueError as err:
        raise err


def delete_course_tag(db: Session, tag_id: int) -> bool:
    try:
        course_tag = db.query(models.CourseTags).filter_by(id=tag_id).first()
        if course_tag:
            db.delete(course_tag)
            db.commit()
            return True
        raise ValueError("Course tag not found")
    except ValueError as err:
        raise err
