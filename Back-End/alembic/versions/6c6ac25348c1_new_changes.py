"""new changes

Revision ID: 6c6ac25348c1
Revises: ff7e61de93e4
Create Date: 2022-12-06 17:39:04.878192

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6c6ac25348c1'
down_revision = 'ff7e61de93e4'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('global_knowledge_test_questions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('question', sa.String(length=500), nullable=True),
    sa.Column('lesson_id', sa.Integer(), nullable=True),
    sa.Column('answer', sa.String(length=500), nullable=True),
    sa.Column('global_knowledge_test_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['global_knowledge_test_id'], ['global_knowledge_test.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('global_knowledge_test_questions')
    # ### end Alembic commands ###
