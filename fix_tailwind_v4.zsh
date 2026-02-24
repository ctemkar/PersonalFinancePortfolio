#!/bin/zsh
set -e
FRONTEND="/Users/chetantemkar/personal-finance-app/frontend"
cd "$FRONTEND"
rm -f postcss.config.js
npm remove postcss autoprefixer @tailwindcss/postcss
cat << 'X' > "$FRONTEND/package.json"
{
  "name": "personal-finance-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.48.0",
    "@tanstack/react-query": "^5.60.0",
    "react": "^18.3.1",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react-swc": "^3.7.0",
    "tailwindcss": "^4.0.0",
    "vite": "^6.0.0"
  }
}
X
npm install
echo "Tailwind v4 fixed. PostCSS removed. Ready to run."
