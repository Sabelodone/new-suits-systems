"""Changed file_desc to file_content for document.py

Revision ID: dd6849941622
Revises: e10749587869
Create Date: 2024-10-30 15:43:04.587860

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dd6849941622'
down_revision = 'e10749587869'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('document', schema=None) as batch_op:
        batch_op.add_column(sa.Column('file_content', sa.LargeBinary(), nullable=False))
        batch_op.drop_column('file_desc')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('document', schema=None) as batch_op:
        batch_op.add_column(sa.Column('file_desc', sa.BLOB(), nullable=False))
        batch_op.drop_column('file_content')

    # ### end Alembic commands ###
