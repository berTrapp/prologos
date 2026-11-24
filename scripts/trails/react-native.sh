. /trails/lib.sh; mkdir -p /work && cd /work
step "Instalar o Node" node -v
step "Criar o app" "npx create-expo-app@latest meu-app --yes && test -d meu-app/src/app && test -f meu-app/app.json"
cd meu-app
serve "Abrir (servidor do Expo)" http://localhost:8081/ "npx expo start"
report
