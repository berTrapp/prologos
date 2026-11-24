. /trails/lib.sh; mkdir -p /work && cd /work
step "Instalar o Python" python --version
step "Criar o ambiente virtual" python -m venv .venv
. .venv/bin/activate
step "Instalar o Django e criar o projeto" "pip install -q django && django-admin startproject config ."
serve "Migrar e rodar" http://localhost:8000/ "python manage.py migrate && python manage.py runserver"
step "Primeiro teste" python manage.py test
report
