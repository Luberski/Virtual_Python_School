"""new changes

Revision ID: b727f9c20ddf
Revises: 3c66e8c07bca
Create Date: 2023-02-04 14:23:26.571971

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b727f9c20ddf'
down_revision = '3c66e8c07bca'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('lessons', sa.Column('order', sa.Integer(), autoincrement=True, nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('lessons', 'order')
    # ### end Alembic commands ###
