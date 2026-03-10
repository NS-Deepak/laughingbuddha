Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "curl -s http://localhost:3001/api/cron/trigger", 0, False
