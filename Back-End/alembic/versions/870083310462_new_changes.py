"""new changes

Revision ID: 870083310462
Revises: 5e73bffba848
Create Date: 2022-09-20 15:05:12.436038

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '870083310462'
down_revision = '5e73bffba848'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('answers_history', sa.Column('date', sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('answers_history', 'date')
    # ### end Alembic commands ###