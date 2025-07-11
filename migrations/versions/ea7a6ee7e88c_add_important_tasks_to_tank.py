"""Add important_tasks to Tank

Revision ID: ea7a6ee7e88c
Revises: 5215be1f3cf0
Create Date: 2025-06-17 14:37:57.263522

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ea7a6ee7e88c'
down_revision = '5215be1f3cf0'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('tank', schema=None) as batch_op:
        batch_op.add_column(sa.Column('important_tasks', sa.JSON(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('tank', schema=None) as batch_op:
        batch_op.drop_column('important_tasks')

    # ### end Alembic commands ###
