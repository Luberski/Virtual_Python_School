from typing import Union
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models


def get_total_number_of_incorrect_answers(
    db: Session, user: models.User
) -> Union[int, None]:
    try:
        total_number_of_incorrect_answers = (
            db.query(func.count(models.AnswersHistory.id))
            .filter(models.AnswersHistory.user_id == user.id)
            .filter(models.AnswersHistory.is_correct == False)
            .scalar()
        )
        return total_number_of_incorrect_answers
    except ValueError as err:
        return err


def get_total_number_of_correct_answers(
    db: Session, user: models.User
) -> Union[int, None]:
    try:
        total_number_of_correct_answers = (
            db.query(func.count(models.AnswersHistory.id))
            .filter(models.AnswersHistory.user_id == user.id)
            .filter(models.AnswersHistory.is_correct == True)
            .scalar()
        )
        return total_number_of_correct_answers
    except ValueError as err:
        return err


def get_total_number_of_answers(db: Session, user: models.User) -> Union[int, None]:
    try:
        total_number_of_answers = (
            db.query(func.count(models.AnswersHistory.id))
            .filter(models.AnswersHistory.user_id == user.id)
            .scalar()
        )
        return total_number_of_answers
    except ValueError as err:
        return err
