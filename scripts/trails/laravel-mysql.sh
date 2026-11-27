. /trails/lib.sh
# Setup steps of the MySQL option (RN 15), after the Laravel trail. Docker is the host's;
# the database is published on 53306 so it never touches a MySQL already on 3306.
apk add -q docker-cli docker-cli-compose >/dev/null 2>&1
docker-php-ext-install -j"$(nproc)" pdo_mysql >/dev/null 2>&1
composer create-project -q laravel/laravel /work/laravel-my && cd /work/laravel-my
cat > docker-compose.yml <<'YML'
services:
  db:
    image: mysql
    environment:
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: "${DB_PASSWORD:?defina DB_PASSWORD no .env}"
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_RANDOM_ROOT_PASSWORD: "yes"
    ports:
      - "53306:3306"
    configs:
      - source: dev-grants
        target: /docker-entrypoint-initdb.d/dev-grants.sql

configs:
  dev-grants:
    content: |
      GRANT ALL PRIVILEGES ON *.* TO '${DB_USERNAME}'@'%';
YML
# The .env the step's 'ok' describes.
sed -i -E 's/^#? ?DB_CONNECTION=.*/DB_CONNECTION=mysql/; s/^#? ?DB_HOST=.*/DB_HOST=127.0.0.1/; s/^#? ?DB_PORT=.*/DB_PORT=53306/; s/^#? ?DB_DATABASE=.*/DB_DATABASE=meu_projeto/; s/^#? ?DB_USERNAME=.*/DB_USERNAME=app/; s/^#? ?DB_PASSWORD=.*/DB_PASSWORD=only-for-this-check/' .env
step "Subir o MySQL" "docker compose -p prologos-laravel-my up -d --wait"
step "Ligar o Laravel ao MySQL" "retry php artisan migrate --force && php artisan db:show | grep -qi mysql"
docker compose -p prologos-laravel-my down -v >/dev/null 2>&1
report
