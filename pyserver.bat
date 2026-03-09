@echo off
echo ========================================
echo Installing dependencies...
echo ========================================
pip install -r backend\requirements.txt
echo ========================================
echo Generating Prisma Client...
echo ========================================
prisma generate
echo ========================================
echo Starting Laughing Buddha Backend...
echo ========================================
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
