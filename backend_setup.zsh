#!/bin/zsh
set -e

ROOT="/Users/chetantemkar/personal-finance-app"
BACKEND_DIR="$ROOT/backend"

cd "$BACKEND_DIR"

echo ">>> Cleaning backend..."
rm -rf node_modules package-lock.json

echo ">>> Installing backend dependencies..."
npm install

echo ">>> Backend ready."
