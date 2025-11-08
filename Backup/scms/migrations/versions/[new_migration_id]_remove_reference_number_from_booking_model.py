"""Remove reference_number from Booking model

Revision ID: [new_migration_id]
Revises: e329b515c19f
Create Date: [current_date_and_time]

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '[new_migration_id]'
down_revision = 'e329b515c19f'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('booking', schema=None) as batch_op:
        batch_op.drop_index('ix_booking_reference_number')
        batch_op.drop_constraint('uq_booking_reference_number', type_='unique')
        batch_op.drop_column('reference_number')

def downgrade():
    with op.batch_alter_table('booking', schema=None) as batch_op:
        batch_op.add_column(sa.Column('reference_number', sa.String(length=13), nullable=False))
        batch_op.create_unique_constraint('uq_booking_reference_number', ['reference_number'])
        batch_op.create_index('ix_booking_reference_number', ['reference_number'], unique=True)