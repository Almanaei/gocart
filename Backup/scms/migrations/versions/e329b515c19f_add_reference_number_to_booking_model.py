"""Add reference number to Booking model

Revision ID: e329b515c19f
Revises: 36f2c88c00a7
Create Date: 2024-09-09 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'e329b515c19f'
down_revision = '36f2c88c00a7'
branch_labels = None
depends_on = None

def generate_reference_number(connection, date, sequence):
    # Format: YYYYMMDD-XXXX where XXXX is a zero-padded sequential number
    date_str = date.strftime("%Y%m%d")
    return f"{date_str}-{sequence:04d}"

def upgrade():
    # Check if the column already exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = inspector.get_columns('booking')
    column_names = [c['name'] for c in columns]

    if 'reference_number' not in column_names:
        # Add the column without NOT NULL constraint
        with op.batch_alter_table('booking', schema=None) as batch_op:
            batch_op.add_column(sa.Column('reference_number', sa.String(length=13), nullable=True))

    # Create a table object for the booking table
    booking_table = table('booking',
        column('id', sa.Integer),
        column('reference_number', sa.String(13)),
        column('booking_date', sa.String(10))
    )

    # Generate and update reference numbers for existing rows
    connection = op.get_bind()
    results = connection.execute(sa.select(booking_table.c.id, booking_table.c.booking_date, booking_table.c.reference_number)).fetchall()
    
    current_date = None
    sequence = 0
    
    for row in results:
        if row[2] is None:  # Only update if reference_number is None
            booking_date = datetime.strptime(row[1], '%Y-%m-%d').date() if row[1] else datetime.now().date()
            
            if booking_date != current_date:
                current_date = booking_date
                sequence = 1
            else:
                sequence += 1
            
            reference_number = generate_reference_number(connection, current_date, sequence)
            
            connection.execute(
                booking_table.update().
                where(booking_table.c.id == row[0]).
                values(reference_number=reference_number)
            )

    # Now add NOT NULL constraint and create unique index
    with op.batch_alter_table('booking', schema=None) as batch_op:
        batch_op.alter_column('reference_number', nullable=False)
        batch_op.create_unique_constraint('uq_booking_reference_number', ['reference_number'])
        batch_op.create_index('ix_booking_reference_number', ['reference_number'], unique=True)

def downgrade():
    with op.batch_alter_table('booking', schema=None) as batch_op:
        batch_op.drop_index('ix_booking_reference_number')
        batch_op.drop_constraint('uq_booking_reference_number', type_='unique')
        batch_op.drop_column('reference_number')
