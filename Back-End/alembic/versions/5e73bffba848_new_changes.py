"""new changes

Revision ID: 5e73bffba848
Revises: e2cc7a7ba63d
Create Date: 2022-09-20 15:01:47.131261

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5e73bffba848'
down_revision = 'e2cc7a7ba63d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('answers_history', sa.Column('is_correct', sa.Boolean(), nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('answers_history', 'is_correct')
    # ### end Alembic commands ###
