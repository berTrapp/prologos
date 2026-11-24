. /trails/lib.sh; apk add -q nodejs npm curl >/dev/null; mkdir -p /work && cd /work
step "Instalar PHP e Composer" "php -v && composer -V"
step "Criar o projeto" "composer create-project -q laravel/laravel meu-projeto && test -f meu-projeto/artisan"
cd meu-projeto
serve "Instalar o front e rodar tudo" http://localhost:8000/ "npm install && composer run dev"
step "Primeiro teste" php artisan test
report
