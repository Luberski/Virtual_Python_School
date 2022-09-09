from typing import Union
from sqlalchemy.orm import Session
from app import models


def get_all_dynamic_courses(
    db: Session, user: models.User, populate: bool
) -> Union[list, Exception]:
    try:
        if populate:
            dynamic_courses = (
                db.query(models.DynamicCourses).filter_by(user_id=user.id).all()
            )
            if dynamic_courses is None:
                raise ValueError("Dynamic courses not found")
            dynamic_courses_populated = []
            for dynamic_course in dynamic_courses:
                dynamic_lessons = (
                    db.query(models.DynamicLessons)
                    .filter_by(dynamic_course_id=dynamic_course.id)
                    .join(
                        models.Lessons,
                        models.DynamicLessons.lesson_id == models.Lessons.id,
                    )
                    .add_columns(
                        models.DynamicLessons.id,
                        models.DynamicLessons.dynamic_course_id,
                        models.DynamicLessons.completed,
                        models.DynamicLessons.start_date,
                        models.DynamicLessons.end_date,
                        models.Lessons.id.label("lesson_id"),
                        models.Lessons.name.label("lesson_name"),
                        models.Lessons.description.label("lesson_description"),
                        models.Lessons.type.label("lesson_type"),
                        models.Lessons.number_of_answers.label(
                            "lesson_number_of_answers"
                        ),
                    )
                    .group_by(models.DynamicLessons.id)
                    .all()
                )
                total_lessons_count = 0
                total_completed_lessons_count = 0
                for lesson in dynamic_lessons:
                    total_lessons_count += 1
                    if lesson.completed:
                        total_completed_lessons_count += 1
                if dynamic_lessons is None:
                    raise ValueError("Dynamic lessons not found")
                dynamic_courses_populated.append(
                    {
                        "id": dynamic_course.id,
                        "name": dynamic_course.name,
                        "user_id": dynamic_course.user_id,
                        "is_dynamic": True,
                        "total_lessons_count": total_lessons_count,
                        "total_completed_lessons_count": total_completed_lessons_count,
                        "lessons": [
                            {
                                "id": dynamic_lesson.id,
                                "lesson_id": dynamic_lesson.lesson_id,
                                "name": dynamic_lesson.lesson_name,
                                "description": dynamic_lesson.lesson_description,
                                "type": dynamic_lesson.lesson_type,
                                "number_of_answers": dynamic_lesson.lesson_number_of_answers,
                                "completed": dynamic_lesson.completed,
                                "start_date": dynamic_lesson.start_date,
                                "end_date": dynamic_lesson.end_date,
                            }
                            for dynamic_lesson in dynamic_lessons
                        ],
                    }
                )

            return dynamic_courses_populated

        dynamic_courses = (
            db.query(models.DynamicCourses).filter_by(user_id=user.id).all()
        )
        if dynamic_courses is None:
            raise ValueError("Dynamic courses not found")
        return [
            {
                "id": dynamic_course.id,
                "name": dynamic_course.name,
                "user_id": dynamic_course.user_id,
                "is_dynamic": True,
                "lessons": [
                    {
                        "id": dynamic_lesson.id,
                        "lesson_id": dynamic_lesson.lesson_id,
                    }
                    for dynamic_lesson in dynamic_course.dynamic_lessons
                ],
            }
            for dynamic_course in dynamic_courses
        ]
    except ValueError as err:
        raise err


def get_dynamic_course_by_id(
    db: Session, user: models.User, dynamic_course_id: int, populate: bool
) -> Union[dict, Exception]:
    try:
        if populate:
            dynamic_course = (
                db.query(models.DynamicCourses)
                .filter_by(id=dynamic_course_id, user_id=user.id)
                .first()
            )
            if dynamic_course is None:
                raise ValueError("Dynamic course not found")
            dynamic_lessons = (
                db.query(models.DynamicLessons)
                .filter_by(dynamic_course_id=dynamic_course.id)
                .join(
                    models.Lessons, models.DynamicLessons.lesson_id == models.Lessons.id
                )
                .add_columns(
                    models.DynamicLessons.id,
                    models.DynamicLessons.dynamic_course_id,
                    models.DynamicLessons.completed,
                    models.DynamicLessons.start_date,
                    models.DynamicLessons.end_date,
                    models.Lessons.id.label("lesson_id"),
                    models.Lessons.name.label("lesson_name"),
                    models.Lessons.description.label("lesson_description"),
                    models.Lessons.type.label("lesson_type"),
                    models.Lessons.number_of_answers.label("lesson_number_of_answers"),
                )
                .group_by(models.DynamicLessons.id)
                .all()
            )
            total_lessons_count = 0
            total_completed_lessons_count = 0
            for lesson in dynamic_lessons:
                total_lessons_count += 1
                if lesson.completed:
                    total_completed_lessons_count += 1
            if dynamic_lessons is None:
                raise ValueError("Dynamic lessons not found")

            return {
                "id": dynamic_course.id,
                "name": dynamic_course.name,
                "user_id": dynamic_course.user_id,
                "is_dynamic": True,
                "total_lessons_count": total_lessons_count,
                "total_completed_lessons_count": total_completed_lessons_count,
                "lessons": [
                    {
                        "id": dynamic_lesson.id,
                        "lesson_id": dynamic_lesson.lesson_id,
                        "name": dynamic_lesson.lesson_name,
                        "description": dynamic_lesson.lesson_description,
                        "type": dynamic_lesson.lesson_type,
                        "number_of_answers": dynamic_lesson.lesson_number_of_answers,
                        "completed": dynamic_lesson.completed,
                        "start_date": dynamic_lesson.start_date,
                        "end_date": dynamic_lesson.end_date,
                    }
                    for dynamic_lesson in dynamic_lessons
                ],
            }

        dynamic_course = (
            db.query(models.DynamicCourses)
            .filter_by(id=dynamic_course_id, user_id=user.id)
            .first()
        )
        if dynamic_course is None:
            raise ValueError("Dynamic course not found")

        return {
            "id": dynamic_course.id,
            "name": dynamic_course.name,
            "user_id": dynamic_course.user_id,
            "is_dynamic": True,
            "lessons": [
                {
                    "id": dynamic_lesson.id,
                    "lesson_id": dynamic_lesson.lesson_id,
                }
                for dynamic_lesson in dynamic_course.dynamic_lessons
            ],
        }

    except ValueError as err:
        raise err


def get_dynamic_lesson_by_id(
    db: Session, user: models.User, dynamic_course_id: int, dynamic_lesson_id: int
) -> Union[dict, Exception]:
    try:
        dynamic_lesson = (
            db.query(models.DynamicLessons)
            .filter_by(
                user_id=user.id,
                dynamic_course_id=dynamic_course_id,
                id=dynamic_lesson_id,
            )
            .join(models.Lessons, models.DynamicLessons.lesson_id == models.Lessons.id)
            .add_columns(
                models.DynamicLessons.id,
                models.DynamicLessons.dynamic_course_id,
                models.DynamicLessons.completed,
                models.DynamicLessons.start_date,
                models.DynamicLessons.end_date,
                models.Lessons.id.label("lesson_id"),
                models.Lessons.name.label("lesson_name"),
                models.Lessons.description.label("lesson_description"),
                models.Lessons.type.label("lesson_type"),
                models.Lessons.number_of_answers.label("lesson_number_of_answers"),
            )
            .group_by(models.DynamicLessons.id)
            .first()
        )

        if dynamic_lesson is None:
            raise ValueError("Dynamic lesson not found")

        return {
            "id": dynamic_lesson.id,
            "lesson_id": dynamic_lesson.lesson_id,
            "name": dynamic_lesson.lesson_name,
            "description": dynamic_lesson.lesson_description,
            "type": dynamic_lesson.lesson_type,
            "number_of_answers": dynamic_lesson.lesson_number_of_answers,
            "completed": dynamic_lesson.completed,
            "start_date": dynamic_lesson.start_date,
            "end_date": dynamic_lesson.end_date,
        }

    except ValueError as err:
        raise err
