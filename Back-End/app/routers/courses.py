from datetime import datetime
from typing import Union
from fastapi import APIRouter, Depends, status, Query, Path
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.routers import deps
from app import models, crud
from app.schemas.course import (
    CourseCloseByIdRequest,
    CourseCloseRequest,
    CourseCreateRequest,
    CourseCreateResponse,
    CourseEditRequest,
    CourseJoinByIdRequest,
    CourseJoinRequest,
    CourseJoinResponse,
    CoursesAllResponse,
    CoursesAllResponseDataCollection,
)
from app.settings import ADMIN_ID

router = APIRouter()


@router.post("/courses", tags=["courses"], response_model=CourseCreateResponse)
def create_course(
    request_data: CourseCreateRequest,
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    if db.query(models.User).filter_by(username=username).first().role_id != ADMIN_ID:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    new_course = models.Courses(
        name=request_data.data.name,
        description=request_data.data.description,
        featured=False,
        lang=request_data.data.lang,
    )
    if request_data.data.featured:
        new_course.featured = request_data.data.featured

    db.add(new_course)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {
                "id": new_course.id,
                "name": new_course.name,
                "description": new_course.description,
                "featured": new_course.featured,
                "lang": new_course.lang,
            },
            "error": None,
        },
    )


@router.patch("/courses", tags=["courses"])
def edit_course(
    request_data: CourseEditRequest,
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    if db.query(models.User).filter_by(username=username).first().role_id != ADMIN_ID:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    course_id = request_data.data.course_id
    course_edit = db.query(models.Courses).filter_by(id=course_id).first()
    if course_edit is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Course not found"},
        )

    to_commit = False

    if request_data.data.name:
        course_edit.name = request_data.data.name
        to_commit = True

    if request_data.data.description:
        course_edit.description = request_data.data.description
        to_commit = True

    if request_data.data.featured is not None:
        course_edit.featured = request_data.data.featured
        to_commit = True

    if request_data.data.lang:
        course_edit.lang = request_data.data.lang
        to_commit = True

    if to_commit:
        db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "name": course_edit.name,
                "description": course_edit.description,
                "featured": course_edit.featured,
                "lang": course_edit.lang,
                "tags": [
                    {
                        "id": tag.id,
                        "name": tag.name,
                        "course_id": tag.course_id,
                    }
                    for tag in course_edit.tags
                ],
            },
            "error": None,
        },
    )


@router.delete("/courses/{course_id}", tags=["courses"])
def delete_course(
    course_id: int = Path(title="id of the course to delete"),
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    if db.query(models.User).filter_by(username=username).first().role_id != ADMIN_ID:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )

    db.query(models.EnrolledCourses).filter_by(course_id=course_id).delete()
    for lesson in db.query(models.Lessons).filter_by(course_id=course_id).all():
        db.query(models.Answers).filter_by(lesson_id=lesson.id).delete()
    db.query(models.Lessons).filter_by(course_id=course_id).delete()
    db.query(models.Courses).filter_by(id=course_id).delete()

    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": course_id,
            },
            "error": None,
        },
    )


@router.get("/courses", tags=["courses"], response_model=CoursesAllResponse)
def get_courses_all(
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
    include_lessons: Union[bool, None] = Query(default=False),
    limit_lessons: Union[int, None] = Query(default=None, gt=0),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    user = db.query(models.User).filter_by(username=username).first()
    if user is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "User not found"},
        )
    courses_response_data: CoursesAllResponseDataCollection = (
        CoursesAllResponseDataCollection()
    )

    if include_lessons:
        enrolled_courses_with_lessons = (
            db.query(models.EnrolledCourses)
            .filter_by(user_id=user.id)
            .join(models.Courses, models.Courses.id == models.EnrolledCourses.course_id)
            .join(models.Lessons, models.Courses.id == models.Lessons.course_id)
            .all()
        )
        if enrolled_courses_with_lessons:
            for enrolled_course in enrolled_courses_with_lessons:
                total_lessons_count = 0
                for _ in enrolled_course.course.lessons:
                    total_lessons_count += 1
                courses_response_data.append(
                    {
                        "id": enrolled_course.course.id,
                        "name": enrolled_course.course.name,
                        "description": enrolled_course.course.description,
                        "featured": enrolled_course.course.featured,
                        "enrolled": True,
                        "total_lessons_count": total_lessons_count,
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

        courses_with_lessons = (
            db.query(models.Courses)
            .join(models.Lessons, models.Courses.id == models.Lessons.course_id)
            .all()
        )
        if courses_with_lessons:
            for course in courses_with_lessons:
                if course.id not in [
                    enrolled_course.course.id
                    for enrolled_course in enrolled_courses_with_lessons
                ]:
                    total_lessons_count = 0
                    for _ in course.lessons:
                        total_lessons_count += 1
                    courses_response_data.append(
                        {
                            "id": course.id,
                            "name": course.name,
                            "description": course.description,
                            "featured": course.featured,
                            "enrolled": False,
                            "total_lessons_count": total_lessons_count,
                            "lang": course.lang,
                            "tags": [
                                {
                                    "id": tag.id,
                                    "name": tag.name,
                                    "course_id": tag.course_id,
                                }
                                for tag in course.tags
                            ],
                            "lessons": [
                                {
                                    "id": lesson.id,
                                    "name": lesson.name,
                                    "description": lesson.description,
                                    "type": lesson.type,
                                    "number_of_answers": lesson.number_of_answers,
                                }
                                for lesson in course.lessons.limit(limit_lessons)
                            ],
                        }
                    )
    else:
        enrolled_courses = (
            db.query(models.EnrolledCourses)
            .filter_by(user_id=user.id)
            .join(models.Courses, models.Courses.id == models.EnrolledCourses.course_id)
            .all()
        )
        if enrolled_courses:
            for enrolled_course in enrolled_courses:
                courses_response_data.append(
                    {
                        "id": enrolled_course.course.id,
                        "name": enrolled_course.course.name,
                        "description": enrolled_course.course.description,
                        "featured": enrolled_course.course.featured,
                        "enrolled": True,
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

        courses = db.query(models.Courses).all()
        if courses:
            for course in courses:
                if course.id not in [
                    enrolled_course.course.id for enrolled_course in enrolled_courses
                ]:
                    courses_response_data.append(
                        {
                            "id": course.id,
                            "name": course.name,
                            "description": course.description,
                            "featured": course.featured,
                            "enrolled": False,
                            "lang": course.lang,
                            "tags": [
                                {
                                    "id": tag.id,
                                    "name": tag.name,
                                    "course_id": tag.course_id,
                                }
                                for tag in course.tags
                            ],
                        }
                    )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"data": courses_response_data.dict(), "error": None},
    )


@router.get("/courses/featured", tags=["courses"])
def get_courses_all_featured(
    db: Session = Depends(deps.get_db),
):
    courses = db.query(models.Courses).filter_by(featured=True).all()
    if courses is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Courses not found"},
        )
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": [
                {
                    "id": course.id,
                    "name": course.name,
                    "description": course.description,
                    "featured": course.featured,
                    "lang": course.lang,
                    "tags": [
                        {
                            "id": tag.id,
                            "name": tag.name,
                            "course_id": tag.course_id,
                        }
                        for tag in course.tags
                    ],
                }
                for course in courses
            ],
            "error": None,
        },
    )


@router.get("/courses/me", tags=["courses"])
def get_courses_me(
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    user = db.query(models.User).filter_by(username=username).first()
    enrolled_courses = db.query(models.EnrolledCourses).filter_by(user_id=user.id).all()
    if enrolled_courses is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Courses not found"},
        )
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": [
                {
                    "username": username,
                    "course_id": enrolled_course.course_id,
                    "start_date": str(enrolled_course.start_date),
                    "end_date": str(enrolled_course.end_date),
                    "completed": enrolled_course.completed,
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
                for enrolled_course in enrolled_courses
            ],
            "error": None,
        },
    )


@router.get("/courses/enrolled", tags=["courses"])
def get_enrolled_courses(
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
    include_lessons: Union[bool, None] = Query(default=False),
    limit_lessons: Union[int, None] = Query(default=None, gt=0),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    user = db.query(models.User).filter_by(username=username).first()
    if user is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "User not found"},
        )

    try:
        all_enrolled_courses = crud.courses.get_all_enrolled_courses(
            db, user, include_lessons, limit_lessons
        )
        # TODO: add support for limit_lessons in dynamic courses
        all_dynamic_courses = crud.dynamic_courses.get_all_dynamic_courses(
            db, user, True
        )
        all_courses = all_enrolled_courses + all_dynamic_courses

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"data": all_courses},
        )
    except ValueError as err:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": str(err)},
        )


@router.get("/courses/{course_id}", tags=["courses"])
def get_course_by_id(
    db: Session = Depends(deps.get_db),
    course_id: int = Path(title="id of the course"),
    include_lessons: Union[bool, None] = Query(default=False),
    limit_lessons: Union[int, None] = Query(default=None, gt=0),
):
    lessons_exist = False
    if include_lessons:
        course = (
            db.query(models.Courses)
            .filter_by(id=course_id)
            .join(
                models.Lessons,
                models.Lessons.course_id == models.Courses.id,
            )
            .filter_by(course_id=course_id)
            .first()
        )
        if course:
            lessons_exist = True

    if not lessons_exist:
        course = db.query(models.Courses).filter_by(id=course_id).first()

    if course is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Course not found"},
        )

    if lessons_exist:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": {
                    "id": course.id,
                    "name": course.name,
                    "description": course.description,
                    "featured": course.featured,
                    "lang": course.lang,
                    "tags": [
                        {
                            "id": tag.id,
                            "name": tag.name,
                            "course_id": tag.course_id,
                        }
                        for tag in course.tags
                    ],
                    "lessons": [
                        {
                            "id": lesson.id,
                            "name": lesson.name,
                            "description": lesson.description,
                            "type": lesson.type,
                            "number_of_answers": lesson.number_of_answers,
                        }
                        for lesson in course.lessons.limit(limit_lessons)
                    ],
                },
                "error": None,
            },
        )
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": course.id,
                "name": course.name,
                "description": course.description,
                "featured": course.featured,
                "lang": course.lang,
                "tags": [
                    {
                        "id": tag.id,
                        "name": tag.name,
                        "course_id": tag.course_id,
                    }
                    for tag in course.tags
                ],
            },
            "error": None,
        },
    )


@router.get("/courses/{course_id}/enrolled", tags=["courses"])
def get_enrolled_course_by_id(
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
    course_id: int = Path(title="id of the course"),
    include_lessons: Union[bool, None] = Query(default=False),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    user = db.query(models.User).filter_by(username=username).first()
    if user is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "User not found"},
        )

    try:
        course = crud.courses.get_enrolled_course_by_id(
            db, user, course_id, include_lessons
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"data": course},
        )
    except ValueError as err:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": str(err)},
        )


@router.post("/course", tags=["courses"], response_model=CourseJoinResponse)
def enroll_course_me(
    request_data: CourseJoinRequest,
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    user = db.query(models.User).filter_by(username=username).first()

    course_wanted = request_data.data.course_id
    if course_wanted is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Course does not exist"},
        )
    course_query = db.query(models.Courses).filter_by(id=course_wanted).first()
    if course_query is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Course not found"},
        )

    check_exist = (
        db.query(models.EnrolledCourses)
        .filter_by(user_id=user.id, course_id=course_wanted)
        .first()
    )
    if check_exist:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "User attends in course"},
        )

    enrolled_course = models.EnrolledCourses(
        course_id=course_query.id,
        user_id=user.id,
        start_date=datetime.now(),
        end_date=None,
        completed=False,
    )
    db.add(enrolled_course)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "username": username,
                "user_id": enrolled_course.user_id,
                "id": enrolled_course.course_id,
                "start_date": str(enrolled_course.start_date),
                "end_date": str(enrolled_course.end_date),
                "completed": enrolled_course.completed,
            },
            "error": None,
        },
    )


@router.post("/course/id", tags=["courses"], response_model=CourseJoinResponse)
def enroll_course_id(
    request_data: CourseJoinByIdRequest,
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    if db.query(models.User).filter_by(username=username).first().role_id != ADMIN_ID:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    id = request_data.data.id
    user = db.query(models.User).filter_by(username=id).first()
    if user is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "User not found"},
        )
    course_wanted = request_data.data.course_id

    if course_wanted is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Course does not exist"},
        )
    course_query = db.query(models.Courses).filter_by(id=course_wanted).first()

    if course_query is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Course not found"},
        )

    check_exist = (
        db.query(models.EnrolledCourses)
        .filter_by(user_id=user.id, course_id=course_wanted)
        .first()
    )

    if check_exist:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "User attends in course"},
        )
    enrolled_course = models.EnrolledCourses(
        course_id=course_query.id,
        user_id=user.id,
        start_date=datetime.now(),
        end_date=None,
        completed=False,
    )
    db.add(enrolled_course)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "username": username,
                "user_id": enrolled_course.user_id,
                "course_id": enrolled_course.course_id,
                "start_date": str(enrolled_course.start_date),
                "end_date": str(enrolled_course.end_date),
                "completed": enrolled_course.completed,
            },
            "error": None,
        },
    )


@router.post("/course/close/me", tags=["courses"])
def close_course_me(
    request_data: CourseCloseRequest,
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    user = db.query(models.User).filter_by(username=username).first()

    course_wanted = request_data.data.course_id

    if course_wanted is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Course does not exist"},
        )

    course_query = db.query(models.Courses).filter_by(id=course_wanted).first()
    if course_query is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Course not found"},
        )

    course_to_close = (
        db.query(models.EnrolledCourses)
        .filter_by(user_id=user.id, course_id=course_wanted)
        .first()
    )
    if course_to_close is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "User does not attend in course"},
        )
    course_to_close.end_date = datetime.now()
    # TODO: automaticlly complete after add lessions

    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "username": username,
                "user_id": course_to_close.user_id,
                "course_id": course_to_close.course_id,
                "start_date": str(course_to_close.start_date),
                "end_date": str(course_to_close.end_date),
                "completed": course_to_close.completed,
            },
            "error": None,
        },
    )


@router.post("/course/close", tags=["courses"])
def close_course_id(
    request_data: CourseCloseByIdRequest,
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    if db.query(models.User).filter_by(username=username).first().role_id != ADMIN_ID:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    id = request_data.data.id
    user = db.query(models.User).filter_by(username=id).first()
    if user is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "User not found"},
        )
    course_wanted = request_data.data.course_id

    if course_wanted is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Course does not exist"},
        )
    course_query = db.query(models.Courses).filter_by(id=course_wanted).first()

    if course_query is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Course not found"},
        )

    course_to_close = (
        db.query(models.EnrolledCourses)
        .filter_by(user_id=user.id, course_id=course_wanted)
        .first()
    )
    if course_to_close is None:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "User does not attend in course"},
        )
    course_to_close.end_date = datetime.now()
    # TODO: automaticlly complete after add lessions

    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "username": username,
                "user_id": course_to_close.user_id,
                "course_id": course_to_close.course_id,
                "start_date": str(course_to_close.start_date),
                "end_date": str(course_to_close.end_date),
                "completed": course_to_close.completed,
            },
            "error": None,
        },
    )
