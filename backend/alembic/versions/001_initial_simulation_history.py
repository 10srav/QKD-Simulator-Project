"""Initial simulation history table

Revision ID: 001
Revises: None
Create Date: 2026-02-05
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'simulation_history',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('protocol', sa.String(10), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column('config', sa.JSON(), nullable=False),
        sa.Column('is_secure', sa.Boolean(), nullable=False),
        sa.Column('eve_attack', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('eve_detected', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('qber', sa.Float(), nullable=True),
        sa.Column('key_efficiency', sa.Float(), nullable=True),
        sa.Column('s_parameter', sa.Float(), nullable=True),
        sa.Column('key_match_rate', sa.Float(), nullable=True),
        sa.Column('sifted_key_length', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('execution_time_ms', sa.Float(), nullable=False, server_default='0'),
        sa.Column('full_result', sa.JSON(), nullable=False),
        sa.Column('label', sa.String(255), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('simulation_history')
