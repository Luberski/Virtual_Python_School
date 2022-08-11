from datetime import datetime
from typing import Union
from fastapi import APIRouter, Depends, status, Query, Path
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.routers import deps
from app import models
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
    id_course = request_data.data.id_course
    course_edit = db.query(models.Courses).filter_by(id=id_course).first()
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

    if to_commit:
        db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "name": course_edit.name,
                "description": course_edit.description,
                "featured": course_edit.featured,
            },
            "error": None,
        },
    )


@router.delete("/courses/{id_course}", tags=["courses"])
def delete_course(
    id_course: int = Path(title="id of the course to delete"),
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
    # TODO: change this after add sections + find better option to save completed courses
    db.query(models.CoursesTaken).filter_by(id_course=id_course).delete()
    db.query(models.Lessons).filter_by(id_course=id_course).delete()
    db.query(models.Courses).filter_by(id=id_course).delete()

    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": id_course,
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
        courses_taken_with_lessons = (
            db.query(models.CoursesTaken)
            .filter_by(id_user=user.id)
            .join(models.Courses, models.Courses.id == models.CoursesTaken.id_course)
            .join(models.Lessons, models.Courses.id == models.Lessons.id_course)
            .all()
        )
        if courses_taken_with_lessons:
            for course_taken in courses_taken_with_lessons:
                courses_response_data.append(
                    {
                        "id": course_taken.course.id,
                        "name": course_taken.course.name,
                        "description": course_taken.course.description,
                        "featured": course_taken.course.featured,
                        "enrolled": True,
                        "lessons": [
                            {
                                "id": lesson.id,
                                "name": lesson.name,
                                "description": lesson.description,
                                "type": lesson.type,
                                "number_of_answers": lesson.number_of_answers,
                            }
                            for lesson in course_taken.course.lessons.limit(
                                limit_lessons
                            )
                        ],
                    }
                )

        courses_with_lessons = (
            db.query(models.Courses)
            .join(models.Lessons, models.Courses.id == models.Lessons.id_course)
            .all()
        )
        if courses_with_lessons:
            for course in courses_with_lessons:
                if course.id not in [
                    course_taken.course.id
                    for course_taken in courses_taken_with_lessons
                ]:
                    courses_response_data.append(
                        {
                            "id": course.id,
                            "name": course.name,
                            "description": course.description,
                            "featured": course.featured,
                            "enrolled": False,
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
        courses_taken = (
            db.query(models.CoursesTaken)
            .filter_by(id_user=user.id)
            .join(models.Courses, models.Courses.id == models.CoursesTaken.id_course)
            .all()
        )
        if courses_taken:
            for course_taken in courses_taken:
                courses_response_data.append(
                    {
                        "id": course_taken.course.id,
                        "name": course_taken.course.name,
                        "description": course_taken.course.description,
                        "featured": course_taken.course.featured,
                        "enrolled": True,
                    }
                )

        courses = db.query(models.Courses).all()
        if courses:
            for course in courses:
                if course.id not in [
                    course_taken.course.id for course_taken in courses_taken
                ]:
                    courses_response_data.append(
                        {
                            "id": course.id,
                            "name": course.name,
                            "description": course.description,
                            "featured": course.featured,
                            "enrolled": False,
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
    courses = db.query(models.CoursesTaken).filter_by(id_user=user.id).all()
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
                    "username": username,
                    "id_course": course.id_course,
                    "start_date": str(course.start_date),
                    "end_date": str(course.end_date),
                    "section_number": course.section_number,
                    "completed": course.completed,
                }
                for course in courses
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
    courses_response_data: CoursesAllResponseDataCollection = (
        CoursesAllResponseDataCollection()
    )

    if include_lessons:
        courses_taken_with_lessons = (
            db.query(models.CoursesTaken)
            .filter_by(id_user=user.id)
            .join(models.Courses, models.Courses.id == models.CoursesTaken.id_course)
            .join(models.Lessons, models.Courses.id == models.Lessons.id_course)
            .all()
        )
        if courses_taken_with_lessons:
            for course_taken in courses_taken_with_lessons:
                courses_response_data.append(
                    {
                        "id": course_taken.course.id,
                        "name": course_taken.course.name,
                        "description": course_taken.course.description,
                        "featured": course_taken.course.featured,
                        "enrolled": True,
                        "end_date": str(course_taken.end_date),
                        "section_number": course_taken.section_number,
                        "lessons": [
                            {
                                "id": lesson.id,
                                "start_date": str(course_taken.start_date),
                                "name": lesson.name,
                                "description": lesson.description,
                                "type": lesson.type,
                                "number_of_answers": lesson.number_of_answers,
                            }
                            for lesson in course_taken.course.lessons.limit(
                                limit_lessons
                            )
                        ],
                    }
                )

    else:
        courses_taken = (
            db.query(models.CoursesTaken)
            .filter_by(id_user=user.id)
            .join(models.Courses, models.Courses.id == models.CoursesTaken.id_course)
            .all()
        )
        if courses_taken:
            for course_taken in courses_taken:
                courses_response_data.append(
                    {
                        "id": course_taken.course.id,
                        "start_date": str(course_taken.start_date),
                        "name": course_taken.course.name,
                        "description": course_taken.course.description,
                        "featured": course_taken.course.featured,
                        "enrolled": True,
                        "end_date": str(course_taken.end_date),
                        "section_number": course_taken.section_number,
                    }
                )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"data": courses_response_data.dict(), "error": None},
    )


@router.get("/courses/{id_course}", tags=["courses"])
def get_course_by_id(
    db: Session = Depends(deps.get_db),
    id_course: int = Path(title="id of the course"),
    include_lessons: Union[bool, None] = Query(default=False),
    limit_lessons: Union[int, None] = Query(default=None, gt=0),
):
    lessons_exist = False
    if include_lessons:
        course = (
            db.query(models.Courses)
            .filter_by(id=id_course)
            .join(
                models.Lessons,
                models.Lessons.id_course == models.Courses.id,
            )
            .filter_by(id_course=id_course)
            .first()
        )
        if course:
            lessons_exist = True

    if not lessons_exist:
        course = db.query(models.Courses).filter_by(id=id_course).first()

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
            },
            "error": None,
        },
    )


@router.post("/course", tags=["courses"], response_model=CourseJoinResponse)
def join_course_me(
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

    course_wanted = request_data.data.id_course
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
        db.query(models.CoursesTaken)
        .filter_by(id_user=user.id, id_course=course_wanted)
        .first()
    )
    if check_exist:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "User attends in course"},
        )

    course_taken = models.CoursesTaken(
        id_course=course_query.id,
        id_user=user.id,
        start_date=datetime.now(),
        end_date=None,
        section_number=0,
        completed=False,
    )
    db.add(course_taken)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "username": username,
                "id_user": course_taken.id_user,
                "id": course_taken.id_course,
                "start_date": str(course_taken.start_date),
                "end_date": str(course_taken.end_date),
                "section_number": course_taken.section_number,
                "completed": course_taken.completed,
            },
            "error": None,
        },
    )


@router.post("/course/id", tags=["courses"], response_model=CourseJoinResponse)
def join_course_id(
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
    course_wanted = request_data.data.id_course

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
        db.query(models.CoursesTaken)
        .filter_by(id_user=user.id, id_course=course_wanted)
        .first()
    )

    if check_exist:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "User attends in course"},
        )
    course_taken = models.CoursesTaken(
        id_course=course_query.id,
        id_user=user.id,
        start_date=datetime.now(),
        end_date=None,
        section_number=0,
        completed=False,
    )
    db.add(course_taken)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "username": username,
                "id_user": course_taken.id_user,
                "id_course": course_taken.id_course,
                "start_date": str(course_taken.start_date),
                "end_date": str(course_taken.end_date),
                "section_number": course_taken.section_number,
                "completed": course_taken.completed,
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

    course_wanted = request_data.data.id_course

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
        db.query(models.CoursesTaken)
        .filter_by(id_user=user.id, id_course=course_wanted)
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
                "id_user": course_to_close.id_user,
                "id_course": course_to_close.id_course,
                "start_date": str(course_to_close.start_date),
                "end_date": str(course_to_close.end_date),
                "section_number": course_to_close.section_number,
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
    course_wanted = request_data.data.id_course

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
        db.query(models.CoursesTaken)
        .filter_by(id_user=user.id, id_course=course_wanted)
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
                "id_user": course_to_close.id_user,
                "id_course": course_to_close.id_course,
                "start_date": str(course_to_close.start_date),
                "end_date": str(course_to_close.end_date),
                "section_number": course_to_close.section_number,
                "completed": course_to_close.completed,
            },
            "error": None,
        },
    )
