set -e

ROOT="/Users/chetantemkar/personal-finance-app"
FRONTEND_DIR="$ROOT/frontend"
BACKEND_DIR="$ROOT/backend"

cd "$FRONTEND_DIR"

cat > package.json << 'EOT'
{
  "name": "frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0",
    "react-router-dom": "^6.22.0",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0"
  }
}
EOT

cat > vite.config.js << 'EOT'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
});
EOT

cat > postcss.config.js << 'EOT'
export default {
  plugins: {
    "@tailwindcss/postcss": {}
  }
};
EOT

mkdir -p src

cat > src/tailwind.css << 'EOT'
@import "tailwindcss";
EOT

cat > index.html << 'EOT'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Personal Finance App</title>
  </head>
  <body class="bg-gray-100">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOT

cat > src/main.jsx << 'EOT'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./tailwind.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOT

cat > src/App.jsx << 'EOT'
export default function App() {
  return (
    <div className="p-6 text-center text-2xl font-bold text-blue-600">
      Personal Finance Dashboard
      <div className="mt-2 text-base text-gray-700">
        Tailwind v4 is now working correctly.
      </div>
    </div>
  );
}
EOT

rm -rf node_modules package-lock.json
npm install

cd "$BACKEND_DIR"
rm -rf node_modules package-lock.json
npm install

osascript -e "tell application \"Terminal\" to do script \"cd $BACKEND_DIR && npm run dev\""
osascript -e "tell application \"Terminal\" to do script \"cd $FRONTEND_DIR && npm run dev\""
open http://localhost:5173
