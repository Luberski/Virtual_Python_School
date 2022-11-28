"""new changes

Revision ID: b76fb0a380e0
Revises: 5f3d2fd0eec9
Create Date: 2022-11-20 17:53:56.545489

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'b76fb0a380e0'
down_revision = '5f3d2fd0eec9'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('course_tags', 'name',
               existing_type=mysql.VARCHAR(length=100),
               nullable=False)
    op.drop_index('name', table_name='course_tags')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_index('name', 'course_tags', ['name'], unique=False)
    op.alter_column('course_tags', 'name',
               existing_type=mysql.VARCHAR(length=100),
               nullable=True)
    # ### end Alembic commands ###