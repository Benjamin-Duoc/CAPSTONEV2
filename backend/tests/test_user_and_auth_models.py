from app.models.all_models import User, Role, PressRelease, PhotojournalismPost
from datetime import datetime, timezone

def test_create_user_and_role(db_session):
    """CP-UNIT-01: Validar creación de usuario y persistencia con SQLAlchemy ORM."""
    test_role = Role(name="periodista", description="Rol de redacción")
    db_session.add(test_role)
    db_session.flush()

    user = User(
        first_name="Benjamín",
        last_name="Morales",
        email="benjamin.morales@ci-press.cl",
        role=test_role.name,
        password_hash="argon2_simulated_hash_12345"
    )
    db_session.add(user)
    db_session.commit()

    saved_user = User.query.filter_by(email="benjamin.morales@ci-press.cl").first()
    assert saved_user is not None
    assert saved_user.first_name == "Benjamín"
    assert saved_user.role == "periodista"

def test_press_release_model_creation(db_session):
    """CP-UNIT-02: Validar modelo de Comunicados de Prensa."""
    press = PressRelease(
        title="Lanzamiento Oficial Plataforma CiPress",
        summary="CiPress debuta con herramientas de IA integradas para prensa.",
        report_content="Contenido detallado del comunicado de prensa con cobertura multimedia...",
        institution="Duoc UC",
        author="Equipo CiPress",
        date="2026-11-20"
    )
    db_session.add(press)
    db_session.commit()

    saved_press = PressRelease.query.filter_by(title="Lanzamiento Oficial Plataforma CiPress").first()
    assert saved_press is not None
    assert saved_press.institution == "Duoc UC"
    assert "CiPress debuta" in saved_press.summary
    assert "detallado" in saved_press.report_content
