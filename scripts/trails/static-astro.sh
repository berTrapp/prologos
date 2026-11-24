. /trails/lib.sh; mkdir -p /work && cd /work
step "Instalar o Node" node -v
step "Criar o site" "npm create astro@latest site -- --template basics --install --no-git --yes && test -f site/src/pages/index.astro"
cd site
serve "Rodar" http://localhost:4321/ "npm run dev"
step "Gerar o build" "npm run build && ls dist/*.html"
report
