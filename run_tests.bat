@echo off
echo =======================================================
echo   CiPress - Suite Automatizada de Pruebas QA (Fase 3)
echo =======================================================
cd /d "%~dp0backend"
call .venv\Scripts\activate.bat
pytest tests -v
pause
