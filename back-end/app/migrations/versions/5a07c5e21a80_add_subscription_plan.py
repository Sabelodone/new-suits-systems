"""add subscription plan

Revision ID: 5a07c5e21a80
Revises: 350d482ce220
Create Date: 2024-11-11 20:44:34.320930

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5a07c5e21a80'
down_revision = '350d482ce220'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('subscription_plan',
    sa.Column('name', sa.String(length=50), nullable=False),
    sa.Column('duration_in_months', sa.Integer(), nullable=False),
    sa.Column('description', sa.String(length=200), nullable=True),
    sa.Column('cost', sa.Integer(), nullable=False),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('subscription_plan')
    # ### end Alembic commands ###
