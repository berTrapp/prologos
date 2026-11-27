. /trails/lib.sh
# Setup steps of the PostgreSQL option (RN 15), after the Laravel trail. Docker is the host's;
# the database is published on 55432 so it never touches a PostgreSQL already on 5432.
apk add -q docker-cli docker-cli-compose postgresql-dev >/dev/null 2>&1
docker-php-ext-install -j"$(nproc)" pdo_pgsql >/dev/null 2>&1
composer create-project -q laravel/laravel /work/laravel-pg && cd /work/laravel-pg
cat > docker-compose.yml <<'YML'
services:
  db:
    image: postgres
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: "${DB_PASSWORD:?defina DB_PASSWORD no .env}"
      POSTGRES_DB: ${DB_DATABASE}
    ports:
      - "55432:5432"
YML
# The .env the step's 'ok' describes.
sed -i -E 's/^#? ?DB_CONNECTION=.*/DB_CONNECTION=pgsql/; s/^#? ?DB_HOST=.*/DB_HOST=127.0.0.1/; s/^#? ?DB_PORT=.*/DB_PORT=55432/; s/^#? ?DB_DATABASE=.*/DB_DATABASE=meu_projeto/; s/^#? ?DB_USERNAME=.*/DB_USERNAME=app/; s/^#? ?DB_PASSWORD=.*/DB_PASSWORD=only-for-this-check/' .env
step "Subir o PostgreSQL" "docker compose -p prologos-laravel-pg up -d --wait"
step "Ligar o Laravel ao PostgreSQL" "retry php artisan migrate --force && php artisan db:show | grep -qi pgsql"
docker compose -p prologos-laravel-pg down -v >/dev/null 2>&1
report
