"""new changes

Revision ID: 21c667b05c4e
Revises: d061ed3d05dc
Create Date: 2022-08-24 16:04:18.913682

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '21c667b05c4e'
down_revision = 'd061ed3d05dc'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('dynamic_course_survey',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('dynamic_course_survey_questions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('survey_id', sa.Integer(), nullable=True),
    sa.Column('question', sa.String(length=500), nullable=True),
    sa.ForeignKeyConstraint(['survey_id'], ['dynamic_course_survey.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('dynamic_course_survey_answers',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=True),
    sa.Column('question_id', sa.Integer(), nullable=True),
    sa.Column('rule_type', sa.Integer(), nullable=True),
    sa.Column('rule_value', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['question_id'], ['dynamic_course_survey_questions.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('dynamic_course_survey_user_results',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('survey_id', sa.Integer(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('question_id', sa.Integer(), nullable=True),
    sa.Column('answer_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['answer_id'], ['dynamic_course_survey_answers.id'], ),
    sa.ForeignKeyConstraint(['question_id'], ['dynamic_course_survey_questions.id'], ),
    sa.ForeignKeyConstraint(['survey_id'], ['dynamic_course_survey.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('dynamic_course_survey_user_results')
    op.drop_table('dynamic_course_survey_answers')
    op.drop_table('dynamic_course_survey_questions')
    op.drop_table('dynamic_course_survey')
    # ### end Alembic commands ###
