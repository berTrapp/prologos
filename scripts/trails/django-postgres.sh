. /trails/lib.sh
# Setup steps of the PostgreSQL option (RN 15), after the Django trail. Docker is the host's;
# the database is published on 55432 so it never touches a PostgreSQL already on 5432.
command -v docker >/dev/null || (apt-get update -qq && apt-get install -y -qq docker.io docker-compose >/dev/null)
mkdir -p /work/django-pg && cd /work/django-pg
python -m venv .venv && . .venv/bin/activate
pip install -q django && django-admin startproject config .
# What the Pronto para codar .zip brings: the generated compose file and the filled-in .env.
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
SECRET_KEY=only-for-this-check
DEBUG=True
DB_USER=app
DB_NAME=agenda_de_aulas
DB_PASSWORD=only-for-this-check
DATABASE_URL=postgres://app:only-for-this-check@localhost:55432/agenda_de_aulas
ENV
step "Subir o PostgreSQL" "docker compose -p prologos-django-pg up -d --wait"
step "Ligar o Django ao PostgreSQL" "pip install -q 'psycopg[binary]' django-environ"
# What the step's 'ok' asks to write in config/settings.py.
python - <<'PY'
from pathlib import Path
p = Path('config/settings.py'); s = p.read_text()
s = s.replace('from pathlib import Path', 'from pathlib import Path\nimport environ', 1)
s += '\nenv = environ.Env()\nenviron.Env.read_env(BASE_DIR / ".env")\nDATABASES = {"default": env.db()}\n'
p.write_text(s)
PY
step "Migrar no PostgreSQL" "retry python manage.py migrate && python -c \"import django,os; os.environ['DJANGO_SETTINGS_MODULE']='config.settings'; django.setup(); from django.db import connection; assert connection.vendor=='postgresql', connection.vendor; print('vendor', connection.vendor)\""
docker compose -p prologos-django-pg down -v >/dev/null 2>&1
report
