@echo off
echo ========================================
echo Installing Frontend Dependencies
echo ========================================

echo Installing React Query...
call npm install @tanstack/react-query

echo Installing State Management...
call npm install zustand

echo Installing AG Grid...
call npm install ag-grid-react ag-grid-community

echo Installing Charts...
call npm install lightweight-charts

echo Installing WebSocket...
call npm install react-use-websocket

echo Installing Command Palette...
call npm install cmdk

echo Installing Virtualization...
call npm install react-virtuoso

echo ========================================
echo Installation Complete!
echo ========================================
pause
