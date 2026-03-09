@echo off
echo Installing missing dependencies...
call npm install yahoo-finance2@2.11.3 --save
call npm install tailwindcss-animate@1.0.7 --save-dev
call npm install @radix-ui/react-slot@1.0.2 --save
call npm install class-variance-authority@0.7.0 --save
echo.
echo Dependencies installed. Running build...
call npm run build
