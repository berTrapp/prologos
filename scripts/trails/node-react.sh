. /trails/lib.sh; mkdir -p /work && cd /work
step "Instalar o Node" "node -v && npm -v"
step "Criar o front" "npm create vite@latest web -- --template react-ts --no-interactive && test -f web/src/App.tsx"
step "Criar a API" "mkdir api && cd api && npm init -y >/dev/null && npm i -s express && npm i -s -D typescript tsx @types/express vitest && grep -q express package.json && grep -q vitest package.json"
serve "Rodar o front" http://localhost:5173/ "cd web && npm install && npm run dev"
step "Deixar os testes prontos" "cd api && npx vitest run --passWithNoTests"
report
