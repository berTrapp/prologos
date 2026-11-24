. /trails/lib.sh; mkdir -p /work && cd /work
step "Instalar o Flutter" flutter --version
step "Criar o app" "flutter create meu_app && test -f meu_app/lib/main.dart"
cd meu_app
step "Primeiro teste" flutter test
report
