@echo off
REM Trigger the scheduler every minute
curl -s http://localhost:3001/api/cron/trigger
