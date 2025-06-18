import os
import sys
from logging.config import fileConfig

from sqlalchemy import create_engine, pool
from alembic import context

# 경로 추가 (app/ 폴더 인식 가능하게)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# .env 로드 및 DB 설정
from app.database import SQLALCHEMY_DATABASE_URL
from app.models import Base

# Alembic Config 객체
config = context.config

# 로깅 설정
fileConfig(config.config_file_name)

# SQLAlchemy models에 연결
target_metadata = Base.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(
        url=SQLALCHEMY_DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = create_engine(
        SQLALCHEMY_DATABASE_URL,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()

#  온라인/오프라인 모드 자동 판단
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
