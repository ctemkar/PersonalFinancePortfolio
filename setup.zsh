#!/bin/zsh
set -e

ROOT="/Users/chetantemkar/personal-finance-app"

echo ">>> Running frontend setup..."
$ROOT/frontend_full.zsh

echo ">>> Running backend setup..."
$ROOT/backend_setup.zsh

echo ">>> Setup complete."
