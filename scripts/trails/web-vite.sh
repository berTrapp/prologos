. /trails/lib.sh; mkdir -p /work && cd /work
serve "Criar e rodar o front (Spring e .NET)" http://localhost:5173/ "npm create vite@latest web -- --template react-ts --no-interactive && cd web && npm install && npm run dev"
report
