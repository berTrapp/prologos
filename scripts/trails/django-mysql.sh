. /trails/lib.sh
# Setup steps of the MySQL option (RN 15), after the Django trail. Docker is the host's;
# the database is published on 53306 so it never touches a MySQL already on 3306.
command -v docker >/dev/null || (apt-get update -qq && apt-get install -y -qq docker.io docker-compose >/dev/null)
mkdir -p /work/django-my && cd /work/django-my
python -m venv .venv && . .venv/bin/activate
pip install -q django && django-admin startproject config .
# What the Pronto para codar .zip brings: the generated compose file and the filled-in .env.
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
SECRET_KEY=only-for-this-check
DEBUG=True
DB_USER=app
DB_NAME=agenda_de_aulas
DB_PASSWORD=only-for-this-check
DATABASE_URL=mysql://app:only-for-this-check@127.0.0.1:53306/agenda_de_aulas
ENV
step "Subir o MySQL" "docker compose -p prologos-django-my up -d --wait"
# The step's 'ok': on Linux, mysqlclient builds against the MySQL client library.
step "Bibliotecas do cliente MySQL" "apt-get install -y -qq pkg-config default-libmysqlclient-dev build-essential >/dev/null"
step "Ligar o Django ao MySQL" "pip install -q mysqlclient django-environ"
python - <<'PY'
from pathlib import Path
p = Path('config/settings.py'); s = p.read_text()
s = s.replace('from pathlib import Path', 'from pathlib import Path\nimport environ', 1)
s += '\nenv = environ.Env()\nenviron.Env.read_env(BASE_DIR / ".env")\nDATABASES = {"default": env.db()}\n'
p.write_text(s)
PY
step "Migrar no MySQL" "retry python manage.py migrate && python -c \"import django,os; os.environ['DJANGO_SETTINGS_MODULE']='config.settings'; django.setup(); from django.db import connection; assert connection.vendor=='mysql', connection.vendor; print('vendor', connection.vendor)\""
# A test that touches the database makes Django create test_<name>, which needs the grant.
printf 'from django.contrib.auth.models import User\nfrom django.test import TestCase\n\nclass DbTest(TestCase):\n    def test_db(self):\n        User.objects.create(username="a")\n        self.assertEqual(User.objects.count(), 1)\n' > config/tests.py
step "Testes do Django no MySQL" "python manage.py test config"

docker compose -p prologos-django-my down -v >/dev/null 2>&1
report
