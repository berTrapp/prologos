. /trails/lib.sh
# Setup steps of the MySQL option (RN 15), after the Node trail. Docker is the host's;
# the database is published on 53306 so it never touches a MySQL already on 3306.
command -v docker >/dev/null || (apt-get update -qq && apt-get install -y -qq docker.io docker-compose >/dev/null)
mkdir -p /work/node-my && cd /work/node-my
mkdir api && (cd api && npm init -y >/dev/null && npm i -q express && npm i -q -D typescript tsx @types/express vitest)
cat > docker-compose.yml <<'YML'
services:
  db:
    image: mysql
    environment:
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: "${DB_PASSWORD:?defina DB_PASSWORD no .env}"
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_RANDOM_ROOT_PASSWORD: "yes"
    ports:
      - "53306:3306"
    configs:
      - source: dev-grants
        target: /docker-entrypoint-initdb.d/dev-grants.sql

configs:
  dev-grants:
    content: |
      GRANT ALL PRIVILEGES ON *.* TO '${DB_USER}'@'%';
YML
cat > .env <<'ENV'
PORT=3000
DB_USER=app
DB_NAME=agenda_de_aulas
DB_PASSWORD=only-for-this-check
DATABASE_URL=mysql://app:only-for-this-check@localhost:53306/agenda_de_aulas
ENV
step "Subir o MySQL" "docker compose -p prologos-node-my up -d --wait"
step "Ligar a API ao MySQL com o Prisma" "cd api && npm i -q @prisma/client@7 && npm i -q -D prisma@7 dotenv && npx prisma init --datasource-provider mysql && rm .env"
cd api
sed -i 's#import "dotenv/config";#import { config } from "dotenv";\nconfig({ path: "../.env" });#' prisma7.config.ts
printf '\nmodel Lesson {\n  id Int @id @default(autoincrement())\n}\n' >> prisma/schema.prisma
step "Migrar no MySQL" "retry npx prisma migrate dev --name init && test -d prisma/migrations"
cd .. && docker compose -p prologos-node-my down -v >/dev/null 2>&1
report
