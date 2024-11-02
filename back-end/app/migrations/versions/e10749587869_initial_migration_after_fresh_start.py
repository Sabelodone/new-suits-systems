"""Initial migration after fresh start

Revision ID: e10749587869
Revises: 
Create Date: 2024-10-30 12:55:39.851139

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e10749587869'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('case_category',
    sa.Column('name', sa.String(length=80), nullable=False),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('customer',
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('email', sa.String(length=100), nullable=False),
    sa.Column('billing_info', sa.Text(), nullable=True),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('document_status',
    sa.Column('name', sa.String(length=30), nullable=False),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('document_type',
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('gender',
    sa.Column('name', sa.String(length=50), nullable=False),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('task_status',
    sa.Column('name', sa.String(length=30), nullable=False),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('workflows',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=50), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('case_status',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=30), nullable=False),
    sa.Column('workflow_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('client',
    sa.Column('first_name', sa.String(length=50), nullable=False),
    sa.Column('last_name', sa.String(length=50), nullable=False),
    sa.Column('middle_name', sa.String(length=50), nullable=True),
    sa.Column('email', sa.String(length=50), nullable=False),
    sa.Column('birthdate', sa.DateTime(), nullable=True),
    sa.Column('national_id', sa.String(length=31), nullable=False),
    sa.Column('gender_id', sa.String(length=32), nullable=False),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['gender_id'], ['gender.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('invoice',
    sa.Column('customer_id', sa.String(length=32), nullable=False),
    sa.Column('amount', sa.Float(), nullable=False),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['customer_id'], ['customer.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('user',
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.Column('username', sa.String(length=50), nullable=False),
    sa.Column('password_hash', sa.String(length=128), nullable=False),
    sa.Column('first_name', sa.String(length=30), nullable=False),
    sa.Column('middle_name', sa.String(length=30), nullable=True),
    sa.Column('last_name', sa.String(length=30), nullable=False),
    sa.Column('birthdate', sa.DateTime(), nullable=True),
    sa.Column('gender_id', sa.String(length=32), nullable=False),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['gender_id'], ['gender.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.create_index('idx_user_email', ['email'], unique=False)
        batch_op.create_index('idx_user_username', ['username'], unique=False)

    op.create_table('client_phone',
    sa.Column('phone_number', sa.String(length=15), nullable=False),
    sa.Column('client_id', sa.String(length=32), nullable=False),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['client_id'], ['client.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('lawfirm',
    sa.Column('user_id', sa.String(length=32), nullable=False),
    sa.Column('employees_count', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('user_id')
    )
    op.create_table('payment',
    sa.Column('invoice_id', sa.String(length=32), nullable=False),
    sa.Column('amount', sa.Float(), nullable=False),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['invoice_id'], ['invoice.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('phone_number',
    sa.Column('user_id', sa.String(length=32), nullable=False),
    sa.Column('phone_number', sa.String(length=15), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('user_id', 'phone_number')
    )
    op.create_table('case',
    sa.Column('title', sa.String(length=120), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('workflow_id', sa.Integer(), nullable=True),
    sa.Column('status_id', sa.String(length=32), nullable=True),
    sa.Column('category_id', sa.String(length=32), nullable=True),
    sa.Column('lawfirm_id', sa.String(length=32), nullable=True),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['category_id'], ['case_category.id'], ),
    sa.ForeignKeyConstraint(['lawfirm_id'], ['lawfirm.user_id'], ),
    sa.ForeignKeyConstraint(['status_id'], ['case_status.id'], ),
    sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('case', schema=None) as batch_op:
        batch_op.create_index('idx_case_title', ['title'], unique=False)

    op.create_table('client_lawfirm',
    sa.Column('client_id', sa.String(length=32), nullable=False),
    sa.Column('lawfirm_id', sa.String(length=32), nullable=False),
    sa.Column('status', sa.Enum('active', 'inactive'), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['client_id'], ['client.id'], ),
    sa.ForeignKeyConstraint(['lawfirm_id'], ['lawfirm.user_id'], ),
    sa.PrimaryKeyConstraint('client_id', 'lawfirm_id')
    )
    op.create_table('lawfirm_employee',
    sa.Column('user_id', sa.String(length=32), nullable=False),
    sa.Column('national_id', sa.String(length=31), nullable=False),
    sa.Column('lawfirm_id', sa.String(length=32), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['lawfirm_id'], ['lawfirm.user_id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('user_id')
    )
    op.create_table('document',
    sa.Column('file_name', sa.String(length=120), nullable=False),
    sa.Column('file_desc', sa.LargeBinary(), nullable=False),
    sa.Column('link', sa.String(length=255), nullable=False),
    sa.Column('case_id', sa.String(length=32), nullable=True),
    sa.Column('document_type_id', sa.String(length=32), nullable=True),
    sa.Column('document_status_id', sa.String(length=32), nullable=True),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['case_id'], ['case.id'], ),
    sa.ForeignKeyConstraint(['document_status_id'], ['document_status.id'], ),
    sa.ForeignKeyConstraint(['document_type_id'], ['document_type.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('task',
    sa.Column('title', sa.String(length=120), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('case_id', sa.String(length=32), nullable=True),
    sa.Column('task_status_id', sa.String(length=32), nullable=True),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['case_id'], ['case.id'], ),
    sa.ForeignKeyConstraint(['task_status_id'], ['task_status.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('document_history',
    sa.Column('document_id', sa.String(length=32), nullable=True),
    sa.Column('user_id', sa.String(length=32), nullable=True),
    sa.Column('action', sa.String(length=32), nullable=False),
    sa.Column('action_date', sa.DateTime(), nullable=False),
    sa.Column('column_name', sa.String(length=30), nullable=True),
    sa.Column('old_value', sa.String(length=500), nullable=True),
    sa.Column('new_value', sa.String(length=500), nullable=True),
    sa.Column('id', sa.String(length=32), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['document_id'], ['document.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('document_history')
    op.drop_table('task')
    op.drop_table('document')
    op.drop_table('lawfirm_employee')
    op.drop_table('client_lawfirm')
    with op.batch_alter_table('case', schema=None) as batch_op:
        batch_op.drop_index('idx_case_title')

    op.drop_table('case')
    op.drop_table('phone_number')
    op.drop_table('payment')
    op.drop_table('lawfirm')
    op.drop_table('client_phone')
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_index('idx_user_username')
        batch_op.drop_index('idx_user_email')

    op.drop_table('user')
    op.drop_table('invoice')
    op.drop_table('client')
    op.drop_table('case_status')
    op.drop_table('workflows')
    op.drop_table('task_status')
    op.drop_table('gender')
    op.drop_table('document_type')
    op.drop_table('document_status')
    op.drop_table('customer')
    op.drop_table('case_category')
    # ### end Alembic commands ###