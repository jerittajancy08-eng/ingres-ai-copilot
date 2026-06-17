from app.db.session import Base, engine, SessionLocal
from app.models import entities  # noqa: F401
from app.models.entities import User


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        if engine.dialect.name == "sqlite":
            user_columns = {row[1] for row in connection.exec_driver_sql("PRAGMA table_info(users)").fetchall()}
            if "role" not in user_columns:
                connection.exec_driver_sql("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'viewer'")
            connection.exec_driver_sql("UPDATE users SET role = 'viewer' WHERE role IS NULL OR role = 'citizen' OR role = 'officer'")

            document_columns = {row[1] for row in connection.exec_driver_sql("PRAGMA table_info(documents)").fetchall()}
            if "access_roles" not in document_columns:
                connection.exec_driver_sql("ALTER TABLE documents ADD COLUMN access_roles TEXT DEFAULT 'viewer'")
            connection.exec_driver_sql("UPDATE documents SET access_roles = 'viewer' WHERE access_roles IS NULL OR access_roles = ''")
    
    # Note: Test users should be created via the /register endpoint or manually
    # Avoid importing hash_password here due to bcrypt Windows compatibility issues
