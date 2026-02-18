#!/bin/zsh
set -e

ROOT="/Users/chetantemkar/personal-finance-app"

echo ">>> Running full setup..."
$ROOT/setup.zsh

echo ">>> Launching backend server..."
osascript -e 'tell application "Terminal" to do script "cd '$ROOT'/backend && npm run dev"'

echo ">>> Launching frontend server..."
osascript -e 'tell application "Terminal" to do script "cd '$ROOT'/frontend && npm run dev"'

echo ">>> Opening browser..."
open http://localhost:5173

echo ">>> All systems running."
