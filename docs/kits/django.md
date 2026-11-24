# Kit — Python + Django

Segue o formato do *Kit modelo — Laravel + React* (`docs/kits/laravel-react.md`). No repositório: `src/content/kits/django.json`.

- **Tipos de projeto:** web, api
- **Recomendado quando a pessoa domina:** django
- **Prefixo de variável pública:** nenhum (configuração entra no build)
- **Arquivos que a leitura do GitHub usa:** `requirements.txt`, `pyproject.toml`, `.env.example`, `docker-compose.yml`
- **Itens:** 24 · pendentes no início: database, hosting, backup, error-tracking
- **Trilha "Preparar o ambiente":** 5 passos
- **Equivalências:** sim

Validado automaticamente: referências entre itens, uma opção recomendada por pendência, nenhum segredo com exemplo ou com prefixo público, textos em pt-BR, en e es. Os comandos e links precisam ser conferidos numa máquina limpa antes de cada release (lista de validação do kit modelo).

```json
{
  "id": "django",
  "version": "1.0.0",
  "name": {
    "pt-BR": "Python + Django",
    "en": "Python + Django",
    "es": "Python + Django"
  },
  "summary": {
    "pt-BR": "Tudo em Python: Django com telas montadas no servidor e HTMX para interatividade.",
    "en": "All Python: Django with server-rendered pages and HTMX for interactivity.",
    "es": "Todo en Python: Django con páginas renderizadas en el servidor y HTMX para interactividad."
  },
  "projectTypes": [
    "web",
    "api"
  ],
  "knownStack": "django",
  "publicEnvPrefix": null,
  "runsOn": ["database", "hosting"],
  "dependencyFiles": [
    "requirements.txt",
    "pyproject.toml",
    ".env.example",
    "docker-compose.yml"
  ],
  "technologies": [
    {
      "id": "python",
      "name": "Python",
      "what": {
        "pt-BR": "A linguagem do projeto inteiro.",
        "en": "The language of the whole project.",
        "es": "El lenguaje de todo el proyecto."
      },
      "docs": "https://docs.python.org/3/"
    },
    {
      "id": "django",
      "name": "Django",
      "what": {
        "pt-BR": "Framework web completo: rotas, banco, formulários, autenticação e painel de administração.",
        "en": "Full web framework: routing, database, forms, authentication and admin panel.",
        "es": "Framework web completo: rutas, base de datos, formularios, autenticación y panel de administración."
      },
      "docs": "https://docs.djangoproject.com/"
    },
    {
      "id": "tpl",
      "name": {
        "pt-BR": "Templates do Django",
        "en": "Django templates",
        "es": "Plantillas de Django"
      },
      "what": {
        "pt-BR": "HTML com marcações que o Django preenche antes de enviar a página.",
        "en": "HTML with tags that Django fills in before sending the page.",
        "es": "HTML con etiquetas que Django completa antes de enviar la página."
      },
      "docs": "https://docs.djangoproject.com/en/stable/topics/templates/"
    },
    {
      "id": "htmx",
      "name": "HTMX",
      "what": {
        "pt-BR": "Atualiza partes da página com atributos no HTML, sem escrever JavaScript.",
        "en": "Updates parts of the page with HTML attributes, without writing JavaScript.",
        "es": "Actualiza partes de la página con atributos HTML, sin escribir JavaScript."
      },
      "docs": "https://htmx.org/docs/"
    }
  ],
  "zones": [
    {
      "id": "method",
      "name": {
        "pt-BR": "Metodologia",
        "en": "Methodology",
        "es": "Metodología"
      },
      "color": "#F472B6"
    },
    {
      "id": "tools",
      "name": {
        "pt-BR": "Ferramentas",
        "en": "Tools",
        "es": "Herramientas"
      },
      "color": "#FACC15"
    },
    {
      "id": "ui",
      "name": {
        "pt-BR": "Interface",
        "en": "Interface",
        "es": "Interfaz"
      },
      "color": "#7C5CFF"
    },
    {
      "id": "app",
      "name": {
        "pt-BR": "Aplicação",
        "en": "Application",
        "es": "Aplicación"
      },
      "color": "#60A5FA"
    },
    {
      "id": "data",
      "name": {
        "pt-BR": "Dados",
        "en": "Data",
        "es": "Datos"
      },
      "color": "#34D399"
    },
    {
      "id": "env",
      "name": {
        "pt-BR": "Ambiente",
        "en": "Environment",
        "es": "Entorno"
      },
      "color": "#FB923C"
    },
    {
      "id": "infra",
      "name": {
        "pt-BR": "Infraestrutura",
        "en": "Infrastructure",
        "es": "Infraestructura"
      },
      "color": "#22D3EE"
    },
    {
      "id": "security",
      "name": {
        "pt-BR": "Segurança",
        "en": "Security",
        "es": "Seguridad"
      },
      "color": "#F87171"
    },
    {
      "id": "observability",
      "name": {
        "pt-BR": "Observabilidade",
        "en": "Observability",
        "es": "Observabilidad"
      },
      "color": "#A3E635"
    }
  ],
  "items": [
    {
      "id": "kanban",
      "zone": "method",
      "name": "Kanban",
      "state": "decided",
      "when": "now",
      "why": {
        "pt-BR": "Um quadro simples (a fazer, fazendo, feito) basta para quem trabalha sozinho.",
        "en": "A simple board (to do, doing, done) is enough when working alone.",
        "es": "Un tablero simple (por hacer, haciendo, hecho) basta para quien trabaja solo."
      }
    },
    {
      "id": "conventional-commits",
      "zone": "method",
      "name": "Conventional Commits",
      "state": "decided",
      "when": "now",
      "why": {
        "pt-BR": "Histórico legível e changelog automático.",
        "en": "Readable history and automatic changelog.",
        "es": "Historial legible y changelog automático."
      },
      "docs": "https://www.conventionalcommits.org"
    },
    {
      "id": "git",
      "zone": "tools",
      "name": "Git + GitHub",
      "state": "decided",
      "when": "now",
      "docs": "https://docs.github.com"
    },
    {
      "id": "pip-venv",
      "zone": "tools",
      "name": "pip + venv",
      "state": "decided",
      "when": "now",
      "tech": "python",
      "why": {
        "pt-BR": "Ambiente isolado por projeto e instalação dos pacotes.",
        "en": "An isolated environment per project and package installation.",
        "es": "Entorno aislado por proyecto e instalación de paquetes."
      },
      "docs": "https://docs.python.org/3/library/venv.html"
    },
    {
      "id": "docker",
      "zone": "tools",
      "name": "Docker",
      "state": "decided",
      "when": "now",
      "why": {
        "pt-BR": "Sobe o banco igual em qualquer máquina.",
        "en": "Runs the database the same on any machine.",
        "es": "Levanta la base igual en cualquier máquina."
      },
      "docs": "https://docs.docker.com"
    },
    {
      "id": "ruff",
      "zone": "tools",
      "name": "Ruff",
      "state": "decided",
      "when": "now",
      "tech": "python",
      "why": {
        "pt-BR": "Formata e aponta erros comuns no código Python.",
        "en": "Formats and flags common mistakes in Python code.",
        "es": "Formatea y señala errores comunes en el código Python."
      },
      "docs": "https://docs.astral.sh/ruff/"
    },
    {
      "id": "templates",
      "zone": "ui",
      "name": {
        "pt-BR": "Templates do Django",
        "en": "Django templates",
        "es": "Plantillas de Django"
      },
      "state": "decided",
      "when": "now",
      "tech": "tpl",
      "why": {
        "pt-BR": "O kit monta as telas no servidor, sem um front separado.",
        "en": "The kit renders pages on the server, without a separate front end.",
        "es": "El kit renderiza las páginas en el servidor, sin front-end separado."
      }
    },
    {
      "id": "htmx",
      "zone": "ui",
      "name": "HTMX",
      "state": "decided",
      "when": "now",
      "tech": "htmx",
      "why": {
        "pt-BR": "Interatividade mantendo tudo em Python.",
        "en": "Interactivity while keeping everything in Python.",
        "es": "Interactividad manteniendo todo en Python."
      }
    },
    {
      "id": "django-app",
      "zone": "app",
      "name": "Django",
      "state": "decided",
      "when": "now",
      "tech": "django",
      "why": {
        "pt-BR": "Centro do projeto; organiza o código em apps.",
        "en": "Core of the project; organizes code into apps.",
        "es": "Centro del proyecto; organiza el código en apps."
      }
    },
    {
      "id": "admin",
      "zone": "app",
      "name": "Django Admin",
      "state": "decided",
      "when": "now",
      "tech": "django",
      "why": {
        "pt-BR": "Painel pronto para cadastrar e consultar dados.",
        "en": "Ready-made panel to create and browse data.",
        "es": "Panel listo para cargar y consultar datos."
      },
      "docs": "https://docs.djangoproject.com/en/stable/ref/contrib/admin/"
    },
    {
      "id": "drf",
      "zone": "app",
      "name": "Django REST Framework",
      "state": "decided",
      "when": "later",
      "tech": "django",
      "why": {
        "pt-BR": "Para quando um app mobile ou outro front precisar de API.",
        "en": "For when a mobile app or another front end needs an API.",
        "es": "Para cuando una app móvil u otro front necesite una API."
      },
      "docs": "https://www.django-rest-framework.org"
    },
    {
      "id": "database",
      "zone": "data",
      "name": {
        "pt-BR": "Banco de dados",
        "en": "Database",
        "es": "Base de datos"
      },
      "state": "pending",
      "when": "now"
    },
    {
      "id": "orm",
      "zone": "data",
      "name": "Django ORM",
      "state": "decided",
      "when": "now",
      "tech": "django",
      "why": {
        "pt-BR": "Classes Python viram tabelas e consultas.",
        "en": "Python classes become tables and queries.",
        "es": "Clases Python se vuelven tablas y consultas."
      },
      "docs": "https://docs.djangoproject.com/en/stable/topics/db/"
    },
    {
      "id": "migrations",
      "zone": "data",
      "name": "Migrations",
      "state": "decided",
      "when": "now",
      "tech": "django",
      "why": {
        "pt-BR": "O Django gera as mudanças do banco a partir dos modelos.",
        "en": "Django generates database changes from the models.",
        "es": "Django genera los cambios de la base a partir de los modelos."
      },
      "docs": "https://docs.djangoproject.com/en/stable/topics/migrations/"
    },
    {
      "id": "env-example",
      "zone": "env",
      "name": ".env.example",
      "state": "decided",
      "when": "now",
      "why": {
        "pt-BR": "Lista as variáveis sem valores secretos, para quem clona o projeto saber o que preencher.",
        "en": "Lists variables without secret values so whoever clones the project knows what to fill in.",
        "es": "Lista las variables sin valores secretos para que quien clone el proyecto sepa qué completar."
      }
    },
    {
      "id": "environments",
      "zone": "env",
      "name": {
        "pt-BR": "Desenvolvimento e produção",
        "en": "Development and production",
        "es": "Desarrollo y producción"
      },
      "state": "decided",
      "when": "now"
    },
    {
      "id": "hosting",
      "zone": "infra",
      "name": {
        "pt-BR": "Hospedagem",
        "en": "Hosting",
        "es": "Hosting"
      },
      "state": "pending",
      "when": "now"
    },
    {
      "id": "github-actions",
      "zone": "infra",
      "name": "GitHub Actions",
      "state": "decided",
      "when": "now",
      "why": {
        "pt-BR": "Roda testes e build a cada push.",
        "en": "Runs tests and build on every push.",
        "es": "Ejecuta pruebas y build en cada push."
      },
      "docs": "https://docs.github.com/actions"
    },
    {
      "id": "auth",
      "zone": "security",
      "name": "Django Auth",
      "state": "decided",
      "when": "now",
      "tech": "django",
      "why": {
        "pt-BR": "Login, senhas e permissões que já vêm com o Django.",
        "en": "Login, passwords and permissions that ship with Django.",
        "es": "Inicio de sesión, contraseñas y permisos que vienen con Django."
      },
      "docs": "https://docs.djangoproject.com/en/stable/topics/auth/"
    },
    {
      "id": "https",
      "zone": "security",
      "name": "HTTPS",
      "state": "decided",
      "when": "now"
    },
    {
      "id": "deploy-check",
      "zone": "security",
      "name": "manage.py check --deploy",
      "state": "decided",
      "when": "now",
      "tech": "django",
      "why": {
        "pt-BR": "Aponta configurações inseguras antes de publicar.",
        "en": "Flags insecure settings before publishing.",
        "es": "Señala configuraciones inseguras antes de publicar."
      },
      "docs": "https://docs.djangoproject.com/en/stable/howto/deployment/checklist/"
    },
    {
      "id": "backup",
      "zone": "security",
      "name": "Backup",
      "state": "pending",
      "when": "now"
    },
    {
      "id": "logs",
      "zone": "observability",
      "name": "Logs",
      "state": "decided",
      "when": "now"
    },
    {
      "id": "error-tracking",
      "zone": "observability",
      "name": {
        "pt-BR": "Captura de erros",
        "en": "Error tracking",
        "es": "Captura de errores"
      },
      "state": "pending",
      "when": "later"
    }
  ],
  "connections": [
    {
      "from": "templates",
      "to": "django-app",
      "type": "rendered-by"
    },
    {
      "from": "htmx",
      "to": "django-app",
      "type": "calls"
    },
    {
      "from": "django-app",
      "to": "orm",
      "type": "uses"
    },
    {
      "from": "orm",
      "to": "database",
      "type": "writes-to"
    },
    {
      "from": "auth",
      "to": "django-app",
      "type": "protects"
    },
    {
      "from": "github-actions",
      "to": "hosting",
      "type": "deploys-to"
    }
  ],
  "flows": [
    {
      "id": "save",
      "name": {
        "pt-BR": "Enviar um formulário",
        "en": "Submit a form",
        "es": "Enviar un formulario"
      },
      "path": [
        "htmx",
        "django-app",
        "orm",
        "database"
      ]
    }
  ],
  "pendingOptions": {
    "database": [
      {
        "name": "PostgreSQL",
        "recommended": true,
        "why": {
          "pt-BR": "O mais completo e um ótimo padrão para produção. Precisa de um servidor de banco (um contêiner Docker resolve no desenvolvimento).",
          "en": "The most complete and a great production default. Needs a database server (a Docker container covers development).",
          "es": "El más completo y un gran estándar para producción. Necesita un servidor de base (un contenedor Docker resuelve el desarrollo)."
        }
      },
      {
        "name": "MySQL",
        "why": {
          "pt-BR": "Muito comum em hospedagens. Funciona bem; tem menos recursos avançados que o PostgreSQL.",
          "en": "Very common on hosting providers. Works well; fewer advanced features than PostgreSQL.",
          "es": "Muy común en hostings. Funciona bien; tiene menos funciones avanzadas que PostgreSQL."
        }
      },
      {
        "name": "SQLite",
        "why": {
          "pt-BR": "Um arquivo só, zero configuração. Ótimo para começar e para protótipos; limitado com muitas escritas ao mesmo tempo.",
          "en": "A single file, zero setup. Great to start and for prototypes; limited under many concurrent writes.",
          "es": "Un solo archivo, cero configuración. Ideal para empezar y prototipos; limitado con muchas escrituras simultáneas."
        }
      }
    ],
    "hosting": [
      {
        "name": {
          "pt-BR": "Plataforma gerenciada (Render, PythonAnywhere)",
          "en": "Managed platform (Render, PythonAnywhere)",
          "es": "Plataforma gestionada (Render, PythonAnywhere)"
        },
        "recommended": true,
        "why": {
          "pt-BR": "Deploy a partir do GitHub, sem cuidar de servidor. Planos gratuitos têm limites.",
          "en": "Deploy from GitHub without managing a server. Free plans have limits.",
          "es": "Deploy desde GitHub sin administrar un servidor. Los planes gratuitos tienen límites."
        }
      },
      {
        "name": {
          "pt-BR": "VPS (Oracle Always Free, Hetzner)",
          "en": "VPS (Oracle Always Free, Hetzner)",
          "es": "VPS (Oracle Always Free, Hetzner)"
        },
        "why": {
          "pt-BR": "Controle total e custo baixo; você instala, atualiza e protege o servidor.",
          "en": "Full control and low cost; you install, update and secure the server.",
          "es": "Control total y bajo costo; tú instalas, actualizas y proteges el servidor."
        }
      },
      {
        "name": {
          "pt-BR": "Só local por enquanto",
          "en": "Local only for now",
          "es": "Solo local por ahora"
        },
        "why": {
          "pt-BR": "Roda na sua máquina; decide a hospedagem quando houver usuários.",
          "en": "Runs on your machine; choose hosting once there are users.",
          "es": "Corre en tu máquina; decide el hosting cuando haya usuarios."
        }
      }
    ],
    "backup": [
      {
        "name": {
          "pt-BR": "Backup diário automático do banco",
          "en": "Automatic daily database backup",
          "es": "Backup diario automático de la base"
        },
        "recommended": true,
        "why": {
          "pt-BR": "A maioria das plataformas gerenciadas oferece; em VPS, uma tarefa agendada com pg_dump resolve.",
          "en": "Most managed platforms offer it; on a VPS, a scheduled pg_dump job does it.",
          "es": "La mayoría de las plataformas gestionadas lo ofrecen; en un VPS, una tarea programada con pg_dump lo resuelve."
        }
      }
    ],
    "error-tracking": [
      {
        "name": "Sentry",
        "recommended": true,
        "why": {
          "pt-BR": "Avisa quando um erro acontece em produção, com a linha do código (sentry-sdk[django]). Tem plano gratuito.",
          "en": "Alerts you when an error happens in production, with the line of code (sentry-sdk[django]). Has a free plan.",
          "es": "Avisa cuando ocurre un error en producción, con la línea de código (sentry-sdk[django]). Tiene plan gratuito."
        }
      },
      {
        "name": {
          "pt-BR": "Só logs por enquanto",
          "en": "Logs only for now",
          "es": "Solo logs por ahora"
        },
        "why": {
          "pt-BR": "Sem custo nem configuração; você só descobre o erro quando alguém reclama.",
          "en": "No cost or setup; you only learn about errors when someone complains.",
          "es": "Sin costo ni configuración; solo te enteras del error cuando alguien se queja."
        }
      }
    ]
  },
  "checklist": {
    "method": [
      "kanban",
      "conventional-commits"
    ],
    "tools": [
      "git",
      "pip-venv",
      "ruff"
    ],
    "ui": [
      "templates",
      "htmx"
    ],
    "app": [
      "django-app",
      "admin"
    ],
    "data": [
      "database",
      "migrations"
    ],
    "env": [
      "env-example",
      "environments"
    ],
    "infra": [
      "hosting",
      "github-actions"
    ],
    "security": [
      "auth",
      "https",
      "deploy-check",
      "backup"
    ],
    "observability": [
      "logs",
      "error-tracking"
    ]
  },
  "prepTrail": [
    {
      "title": {
        "pt-BR": "Instalar o Python",
        "en": "Install Python",
        "es": "Instalar Python"
      },
      "command": "python --version",
      "ok": {
        "pt-BR": "O terminal mostra a versão do Python 3.",
        "en": "The terminal shows the Python 3 version.",
        "es": "La terminal muestra la versión de Python 3."
      },
      "docs": "https://www.python.org/downloads/"
    },
    {
      "title": {
        "pt-BR": "Criar e ativar o ambiente virtual",
        "en": "Create and activate the virtual environment",
        "es": "Crear y activar el entorno virtual"
      },
      "command": "python -m venv .venv",
      "ok": {
        "pt-BR": "Depois de ativar, o terminal mostra (.venv) no início da linha.",
        "en": "After activating, the terminal shows (.venv) at the start of the line.",
        "es": "Tras activarlo, la terminal muestra (.venv) al inicio de la línea."
      }
    },
    {
      "title": {
        "pt-BR": "Instalar o Django e criar o projeto",
        "en": "Install Django and create the project",
        "es": "Instalar Django y crear el proyecto"
      },
      "command": "pip install django && django-admin startproject config .",
      "ok": {
        "pt-BR": "A pasta tem manage.py e config/.",
        "en": "The folder has manage.py and config/.",
        "es": "La carpeta tiene manage.py y config/."
      }
    },
    {
      "title": {
        "pt-BR": "Rodar o servidor",
        "en": "Run the server",
        "es": "Ejecutar el servidor"
      },
      "command": "python manage.py migrate && python manage.py runserver",
      "ok": {
        "pt-BR": "localhost:8000 mostra a página inicial do Django.",
        "en": "localhost:8000 shows the Django welcome page.",
        "es": "localhost:8000 muestra la página de bienvenida de Django."
      }
    },
    {
      "title": {
        "pt-BR": "Primeiro teste passando",
        "en": "First test passing",
        "es": "Primera prueba pasando"
      },
      "command": "python manage.py test",
      "ok": {
        "pt-BR": "O resumo termina com OK.",
        "en": "The summary ends with OK.",
        "es": "El resumen termina con OK."
      }
    }
  ],
  "folders": [
    {
      "path": "config/",
      "what": {
        "pt-BR": "Configuração do projeto: settings.py, urls.py, wsgi.py.",
        "en": "Project configuration: settings.py, urls.py, wsgi.py.",
        "es": "Configuración del proyecto: settings.py, urls.py, wsgi.py."
      }
    },
    {
      "path": "<app>/models.py",
      "what": {
        "pt-BR": "Modelos que viram tabelas.",
        "en": "Models that become tables.",
        "es": "Modelos que se vuelven tablas."
      }
    },
    {
      "path": "<app>/views.py",
      "what": {
        "pt-BR": "Recebem a requisição e devolvem a página.",
        "en": "Receive the request and return the page.",
        "es": "Reciben la petición y devuelven la página."
      }
    },
    {
      "path": "<app>/templates/",
      "what": {
        "pt-BR": "HTML do app, com HTMX.",
        "en": "App HTML, with HTMX.",
        "es": "HTML de la app, con HTMX."
      }
    },
    {
      "path": "<app>/migrations/",
      "what": {
        "pt-BR": "Mudanças do banco geradas pelo Django.",
        "en": "Database changes generated by Django.",
        "es": "Cambios de la base generados por Django."
      }
    },
    {
      "path": "<app>/tests.py",
      "what": {
        "pt-BR": "Testes do app.",
        "en": "App tests.",
        "es": "Pruebas de la app."
      }
    }
  ],
  "envVars": [
    {
      "key": "SECRET_KEY",
      "secret": true,
      "usedIn": [
        "back"
      ],
      "what": {
        "pt-BR": "Assina sessões, cookies e tokens.",
        "en": "Signs sessions, cookies and tokens.",
        "es": "Firma sesiones, cookies y tokens."
      },
      "howToGet": {
        "pt-BR": "python -c \"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())\"",
        "en": "python -c \"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())\"",
        "es": "python -c \"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())\""
      }
    },
    {
      "key": "DEBUG",
      "secret": false,
      "example": "True",
      "usedIn": [
        "back"
      ],
      "what": {
        "pt-BR": "Mostra erros detalhados. True só no seu computador.",
        "en": "Shows detailed errors. True only on your computer.",
        "es": "Muestra errores detallados. True solo en tu computadora."
      }
    },
    {
      "key": "ALLOWED_HOSTS",
      "secret": false,
      "example": "localhost,127.0.0.1",
      "usedIn": [
        "back"
      ],
      "what": {
        "pt-BR": "Domínios que podem acessar o app.",
        "en": "Domains allowed to access the app.",
        "es": "Dominios que pueden acceder a la app."
      }
    },
    {
      "key": "DATABASE_URL",
      "secret": true,
      "usedIn": [
        "back"
      ],
      "what": {
        "pt-BR": "Endereço completo do banco.",
        "en": "Full database address.",
        "es": "Dirección completa de la base."
      },
      "howToGet": {
        "pt-BR": "sqlite:///db.sqlite3 para começar; em produção, o endereço do banco criado.",
        "en": "sqlite:///db.sqlite3 to start; in production, the created database address.",
        "es": "sqlite:///db.sqlite3 para empezar; en producción, la dirección de la base creada."
      }
    }
  ],
  "equivalences": {
    "orm": "Django ORM",
    "migrate": "python manage.py migrate",
    "routes": "urls.py",
    "packages": "pip",
    "devServer": "python manage.py runserver",
    "config": "settings.py + variáveis de ambiente",
    "templates": "Templates do Django",
    "auth": "Django Auth",
    "tests": "python manage.py test"
  },
  "dependencyMap": {
    "django": "django-app",
    "djangorestframework": "drf",
    "django-htmx": "htmx",
    "psycopg": "database",
    "sentry-sdk": "error-tracking",
    "ruff": "ruff"
  }
}
```
