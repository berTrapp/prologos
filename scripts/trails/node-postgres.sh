. /trails/lib.sh
# Setup steps of the PostgreSQL option (RN 15), after the Node trail. Docker is the host's;
# the database is published on 55432 so it never touches a PostgreSQL already on 5432.
command -v docker >/dev/null || (apt-get update -qq && apt-get install -y -qq docker.io docker-compose >/dev/null)
mkdir -p /work/node-pg && cd /work/node-pg
mkdir api && (cd api && npm init -y >/dev/null && npm i -q express && npm i -q -D typescript tsx @types/express vitest)
cat > docker-compose.yml <<'YML'
services:
  db:
    image: postgres
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: "${DB_PASSWORD:?defina DB_PASSWORD no .env}"
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "55432:5432"
YML
cat > .env <<'ENV'
PORT=3000
DB_USER=app
DB_NAME=agenda_de_aulas
DB_PASSWORD=only-for-this-check
DATABASE_URL=postgresql://app:only-for-this-check@localhost:55432/agenda_de_aulas
ENV
step "Subir o PostgreSQL" "docker compose -p prologos-node-pg up -d --wait"
step "Ligar a API ao PostgreSQL com o Prisma" "cd api && npm i -q @prisma/client@7 && npm i -q -D prisma@7 dotenv && npx prisma init --datasource-provider postgresql && rm .env"
# What the step's 'ok' asks: prisma.config.ts reads the .env at the root, and one model to migrate.
cd api
sed -i 's#import "dotenv/config";#import { config } from "dotenv";\nconfig({ path: "../.env" });#' prisma7.config.ts
grep -n dotenv prisma7.config.ts
printf '\nmodel Lesson {\n  id Int @id @default(autoincrement())\n}\n' >> prisma/schema.prisma
step "Migrar no PostgreSQL" "retry npx prisma migrate dev --name init && test -d prisma/migrations"
cd .. && docker compose -p prologos-node-pg down -v >/dev/null 2>&1
report
