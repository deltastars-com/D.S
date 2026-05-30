@echo off
title Delta Stars PWA Server
echo Building project...
call npm install
call npm run build
echo Starting server on http://localhost:5000
start http://localhost:5000
npx serve -s dist -l 5000
