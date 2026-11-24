. /trails/lib.sh; mkdir -p /work && cd /work
step "Instalar o Node" "node -v && npm -v"
step "Criar o front" "npm create vite@latest web -- --template react-ts --no-interactive && test -f web/src/App.tsx"
step "Criar a API" "mkdir api && cd api && npm init -y >/dev/null && npm i -s express && npm i -s -D typescript tsx @types/express && grep -q express package.json"
serve "Rodar os dois (como escrito: npm run dev na raiz)" http://localhost:5173/ "npm run dev"
step "Primeiro teste (como escrito)" "npx vitest run"
report
