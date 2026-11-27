# Kit modelo — Laravel + React

Modelo de conteúdo para os starter kits (RN 14). Os outros 7 kits seguem exatamente este formato. No repositório, cada kit vira um arquivo `src/content/kits/<id>.json`, validado por schema (Zod) na Fase 4.

## Regras do formato

- Todo texto visível é um objeto de tradução: `{ "pt-BR": "...", "en": "...", "es": "..." }`. pt-BR é a referência; `es` pode faltar no início (cai para pt-BR), `en` é obrigatório (RN 14, 17).
- Ids em inglês, minúsculas e hífen. Nomes de tecnologia não se traduzem.
- `state`: `decided` (já vem decidido pelo kit) ou `pending` (vira item tracejado e entra no "O que falta decidir").
- `when`: `now` (Hoje) ou `later` (só no Completo).
- Links só para documentação oficial.
- **Sem número de versão** nos nomes ("Laravel", não "Laravel 11"): a trilha manda instalar a versão estável atual, LTS quando houver. As versões são conferidas a cada release do Prólogos.
- Tipos de conexão permitidos: `calls`, `uses`, `writes-to`, `protects`, `deploys-to`, `rendered-by`.
- Nenhum valor secreto em `envVars` (RN 3): só chave, descrição, onde conseguir e um exemplo seguro quando não é segredo.

## Campos

| Campo | O que é |
| --- | --- |
| `id`, `version` | Identificador e versão do conteúdo do kit |
| `name`, `summary` | Nome e uma frase sobre o kit |
| `projectTypes` | Tipos de projeto em que o kit aparece no início guiado |
| `knownStack` | Stack que, se a pessoa domina, faz este kit ser o recomendado |
| `runsOn` | Itens pendentes perguntados no passo "Onde roda" do início guiado (RN 13) |
| `publicEnvPrefix` | Prefixo de variável exposta ao navegador (RN 3) |
| `dependencyFiles` | Arquivos que a leitura do GitHub usa para este kit (RN 7) |
| `technologies` | Tecnologias do kit, com "o que é" e documentação; usadas no passo "Experiência" |
| `zones` / `items` | O mapa inicial |
| `connections`, `flows` | Ligações e o primeiro fluxo sugerido |
| `pendingOptions` | Opções com consequências para cada item pendente, com a recomendada para começar |
| `checklist` | Itens esperados por zona (RN 5) |
| `prepTrail` | Trilha "Preparar o ambiente" (RN 15) |
| `folders` | Estrutura de pastas explicada |
| `prerequisites` | O que instalar antes de rodar, no README gerado (RN 16); o Docker entra sozinho quando há `docker-compose.yml` |
| `runLocally` | Passos de "Como rodar localmente" para quem clona o repositório: `install` antes de copiar o `.env`, `run` depois de subir o banco (RN 16) |
| `dockerEnv` | Opcional: chaves de usuário, senha e nome do banco que o `docker-compose.yml` lê do `.env`; sem ele, `DB_USER`, `DB_PASSWORD` e `DB_NAME` |
| `gitignore` | Linhas do `.gitignore` gerado para a stack |
| `envVars` | Variáveis do `.env.example` gerado |
| `equivalences` | Conceitos desta stack, para traduzir a partir de outra (RN 15). Comando ou nome técnico fica em texto simples; valor com palavras vem nos 3 idiomas (RN 17) |
| `dependencyMap` | Pacote → item do mapa (RN 7) |
| `items[].concept` | Opcional: conceito da tabela de equivalências que o item representa (RN 15) |

## Conteúdo

```json
{
  "id": "laravel-react",
  "version": "1.0.0",
  "name": { "pt-BR": "Laravel + React", "en": "Laravel + React", "es": "Laravel + React" },
  "summary": {
    "pt-BR": "PHP no back-end com Laravel e uma interface em React servida pelo Vite.",
    "en": "PHP back end with Laravel and a React interface served by Vite.",
    "es": "Back-end en PHP con Laravel e interfaz en React servida por Vite."
  },
  "projectTypes": ["web", "api"],
  "knownStack": "laravel",
  "publicEnvPrefix": "VITE_",
  "runsOn": ["database", "hosting"],
  "dependencyFiles": ["composer.json", "package.json", ".env.example", "docker-compose.yml"],

  "technologies": [
    {
      "id": "php", "name": "PHP",
      "what": { "pt-BR": "A linguagem do back-end.", "en": "The back-end language.", "es": "El lenguaje del back-end." },
      "docs": "https://www.php.net/docs.php"
    },
    {
      "id": "laravel", "name": "Laravel",
      "what": {
        "pt-BR": "Framework do back-end: rotas, banco, filas, e-mail e autenticação prontos.",
        "en": "Back-end framework: routing, database, queues, mail and authentication built in.",
        "es": "Framework del back-end: rutas, base de datos, colas, correo y autenticación incluidos."
      },
      "docs": "https://laravel.com/docs"
    },
    {
      "id": "ts", "name": "TypeScript",
      "what": { "pt-BR": "JavaScript com tipos, usado no front.", "en": "JavaScript with types, used in the front end.", "es": "JavaScript con tipos, usado en el front-end." },
      "docs": "https://www.typescriptlang.org/docs/"
    },
    {
      "id": "react", "name": "React",
      "what": { "pt-BR": "Biblioteca para montar a interface em componentes.", "en": "Library for building the interface out of components.", "es": "Biblioteca para construir la interfaz con componentes." },
      "docs": "https://react.dev"
    }
  ],

  "zones": [
    { "id": "method", "name": { "pt-BR": "Metodologia", "en": "Methodology", "es": "Metodología" }, "color": "#F472B6" },
    { "id": "tools", "name": { "pt-BR": "Ferramentas", "en": "Tools", "es": "Herramientas" }, "color": "#FACC15" },
    { "id": "ui", "name": { "pt-BR": "Interface", "en": "Interface", "es": "Interfaz" }, "color": "#7C5CFF" },
    { "id": "app", "name": { "pt-BR": "Aplicação", "en": "Application", "es": "Aplicación" }, "color": "#60A5FA" },
    { "id": "data", "name": { "pt-BR": "Dados", "en": "Data", "es": "Datos" }, "color": "#34D399" },
    { "id": "env", "name": { "pt-BR": "Ambiente", "en": "Environment", "es": "Entorno" }, "color": "#FB923C" },
    { "id": "infra", "name": { "pt-BR": "Infraestrutura", "en": "Infrastructure", "es": "Infraestructura" }, "color": "#22D3EE" },
    { "id": "security", "name": { "pt-BR": "Segurança", "en": "Security", "es": "Seguridad" }, "color": "#F87171" },
    { "id": "observability", "name": { "pt-BR": "Observabilidade", "en": "Observability", "es": "Observabilidad" }, "color": "#A3E635" }
  ],

  "items": [
    { "id": "kanban", "zone": "method", "name": "Kanban", "state": "decided", "when": "now",
      "why": { "pt-BR": "Um quadro simples (a fazer, fazendo, feito) basta para quem trabalha sozinho.", "en": "A simple board (to do, doing, done) is enough when working alone.", "es": "Un tablero simple (por hacer, haciendo, hecho) basta para quien trabaja solo." } },
    { "id": "conventional-commits", "zone": "method", "name": "Conventional Commits", "state": "decided", "when": "now",
      "why": { "pt-BR": "Histórico legível e changelog automático.", "en": "Readable history and automatic changelog.", "es": "Historial legible y changelog automático." },
      "docs": "https://www.conventionalcommits.org" },

    { "id": "git", "zone": "tools", "name": "Git + GitHub", "state": "decided", "when": "now", "docs": "https://docs.github.com" },
    { "id": "composer", "zone": "tools", "name": "Composer", "tech": "php", "state": "decided", "when": "now", "concept": "packages",
      "why": { "pt-BR": "Instala os pacotes PHP, como o próprio Laravel.", "en": "Installs PHP packages, including Laravel itself.", "es": "Instala los paquetes PHP, incluido el propio Laravel." },
      "docs": "https://getcomposer.org/doc/" },
    { "id": "npm", "zone": "tools", "name": "npm", "tech": "ts", "state": "decided", "when": "now",
      "why": { "pt-BR": "Instala os pacotes do front.", "en": "Installs front-end packages.", "es": "Instala los paquetes del front-end." } },
    { "id": "docker", "zone": "tools", "name": "Docker (Laravel Sail)", "state": "decided", "when": "now",
      "why": { "pt-BR": "Sobe PHP, banco e serviços iguais em qualquer máquina.", "en": "Runs PHP, database and services the same on any machine.", "es": "Levanta PHP, base de datos y servicios igual en cualquier máquina." },
      "docs": "https://laravel.com/docs/sail" },

    { "id": "react-vite", "zone": "ui", "name": "React + Vite", "tech": "react", "state": "decided", "when": "now",
      "why": { "pt-BR": "Interface em componentes, com recarga instantânea durante o desenvolvimento.", "en": "Component-based interface with instant reload while developing.", "es": "Interfaz en componentes, con recarga instantánea durante el desarrollo." },
      "docs": "https://vite.dev/guide/" },
    { "id": "tailwind", "zone": "ui", "name": "Tailwind CSS", "state": "decided", "when": "now", "docs": "https://tailwindcss.com/docs" },

    { "id": "laravel-app", "zone": "app", "name": "Laravel", "tech": "laravel", "state": "decided", "when": "now",
      "why": { "pt-BR": "Centro do back-end: recebe as requisições, aplica as regras e fala com o banco.", "en": "Core of the back end: receives requests, applies rules and talks to the database.", "es": "Centro del back-end: recibe las peticiones, aplica las reglas y habla con la base de datos." } },
    { "id": "rest-api", "zone": "app", "name": "API REST", "tech": "laravel", "state": "decided", "when": "now", "concept": "routes",
      "why": { "pt-BR": "O front em React conversa com o Laravel por rotas em routes/api.php.", "en": "The React front end talks to Laravel through routes in routes/api.php.", "es": "El front-end en React habla con Laravel mediante rutas en routes/api.php." } },
    { "id": "queues", "zone": "app", "name": { "pt-BR": "Filas", "en": "Queues", "es": "Colas" }, "tech": "laravel", "state": "decided", "when": "later",
      "why": { "pt-BR": "Para e-mails e tarefas demoradas sem travar quem está usando.", "en": "For emails and slow tasks without blocking the user.", "es": "Para correos y tareas lentas sin bloquear a quien usa la app." },
      "docs": "https://laravel.com/docs/queues" },

    { "id": "database", "zone": "data", "name": { "pt-BR": "Banco de dados", "en": "Database", "es": "Base de datos" }, "state": "pending", "when": "now" },
    { "id": "eloquent", "zone": "data", "name": "Eloquent", "tech": "laravel", "state": "decided", "when": "now", "concept": "orm",
      "why": { "pt-BR": "Transforma tabelas em classes PHP; evita SQL na mão para o básico.", "en": "Maps tables to PHP classes; avoids hand-written SQL for the basics.", "es": "Convierte tablas en clases PHP; evita escribir SQL a mano para lo básico." },
      "docs": "https://laravel.com/docs/eloquent" },
    { "id": "migrations", "zone": "data", "name": "Migrations", "tech": "laravel", "state": "decided", "when": "now", "concept": "migrate",
      "why": { "pt-BR": "Mudanças do banco em arquivos, em ordem; qualquer pessoa recria o banco do zero.", "en": "Database changes as ordered files; anyone can rebuild the database from scratch.", "es": "Cambios de la base en archivos ordenados; cualquiera recrea la base desde cero." },
      "docs": "https://laravel.com/docs/migrations" },

    { "id": "env-example", "zone": "env", "name": ".env.example", "state": "decided", "when": "now", "concept": "config",
      "why": { "pt-BR": "Lista as variáveis sem valores secretos, para quem clona o projeto saber o que preencher.", "en": "Lists variables without secret values so whoever clones the project knows what to fill in.", "es": "Lista las variables sin valores secretos para que quien clone el proyecto sepa qué completar." } },
    { "id": "environments", "zone": "env", "name": { "pt-BR": "Desenvolvimento e produção", "en": "Development and production", "es": "Desarrollo y producción" }, "state": "decided", "when": "now" },

    { "id": "hosting", "zone": "infra", "name": { "pt-BR": "Hospedagem", "en": "Hosting", "es": "Hosting" }, "state": "pending", "when": "now" },
    { "id": "github-actions", "zone": "infra", "name": "GitHub Actions", "state": "decided", "when": "now",
      "why": { "pt-BR": "Roda testes e build a cada push.", "en": "Runs tests and build on every push.", "es": "Ejecuta pruebas y build en cada push." },
      "docs": "https://docs.github.com/actions" },

    { "id": "sanctum", "zone": "security", "name": "Laravel Sanctum", "tech": "laravel", "state": "decided", "when": "now", "concept": "auth",
      "why": { "pt-BR": "Login do front com o Laravel, por cookie de sessão ou token.", "en": "Front-end login with Laravel, via session cookie or token.", "es": "Inicio de sesión del front-end con Laravel, por cookie de sesión o token." },
      "docs": "https://laravel.com/docs/sanctum" },
    { "id": "https", "zone": "security", "name": "HTTPS", "state": "decided", "when": "now" },
    { "id": "rate-limit", "zone": "security", "name": { "pt-BR": "Limite de tentativas", "en": "Rate limiting", "es": "Límite de intentos" }, "tech": "laravel", "state": "decided", "when": "now",
      "docs": "https://laravel.com/docs/rate-limiting" },
    { "id": "backup", "zone": "security", "name": { "pt-BR": "Backup do banco", "en": "Database backup", "es": "Backup de la base" }, "state": "pending", "when": "now" },

    { "id": "logs", "zone": "observability", "name": "Logs", "tech": "laravel", "state": "decided", "when": "now", "docs": "https://laravel.com/docs/logging" },
    { "id": "error-tracking", "zone": "observability", "name": { "pt-BR": "Captura de erros", "en": "Error tracking", "es": "Captura de errores" }, "state": "pending", "when": "later" }
  ],

  "connections": [
    { "from": "react-vite", "to": "rest-api", "type": "calls" },
    { "from": "rest-api", "to": "laravel-app", "type": "uses" },
    { "from": "laravel-app", "to": "eloquent", "type": "uses" },
    { "from": "eloquent", "to": "database", "type": "writes-to" },
    { "from": "sanctum", "to": "rest-api", "type": "protects" },
    { "from": "github-actions", "to": "hosting", "type": "deploys-to" }
  ],

  "flows": [
    {
      "id": "save",
      "name": { "pt-BR": "Salvar um registro", "en": "Save a record", "es": "Guardar un registro" },
      "path": ["react-vite", "rest-api", "laravel-app", "eloquent", "database"]
    }
  ],

  "pendingOptions": {
    "database": [
      { "name": "PostgreSQL", "recommended": true,
        "why": { "pt-BR": "O mais completo e muito usado com Laravel em produção. Precisa de um servidor de banco (o Sail já sobe um).", "en": "The most complete and widely used with Laravel in production. Needs a database server (Sail starts one).", "es": "El más completo y muy usado con Laravel en producción. Necesita un servidor de base (Sail ya levanta uno)." } },
      { "name": "MySQL",
        "why": { "pt-BR": "Padrão em muitas hospedagens compartilhadas. Funciona bem; tem menos recursos avançados.", "en": "Default on many shared hosts. Works well; fewer advanced features.", "es": "Predeterminado en muchos hostings compartidos. Funciona bien; tiene menos funciones avanzadas." } },
      { "name": "SQLite",
        "why": { "pt-BR": "Um arquivo só, zero configuração. Ótimo para protótipo; limitado com muitos acessos ao mesmo tempo.", "en": "A single file, zero setup. Great for prototypes; limited under many concurrent writes.", "es": "Un solo archivo, cero configuración. Ideal para prototipos; limitado con muchos accesos simultáneos." } }
    ],
    "hosting": [
      { "name": { "pt-BR": "Plataforma gerenciada (Laravel Cloud, Render)", "en": "Managed platform (Laravel Cloud, Render)", "es": "Plataforma gestionada (Laravel Cloud, Render)" }, "recommended": true,
        "why": { "pt-BR": "Deploy a partir do GitHub, sem cuidar de servidor. Planos gratuitos têm limites.", "en": "Deploy from GitHub without managing a server. Free plans have limits.", "es": "Deploy desde GitHub sin administrar un servidor. Los planes gratuitos tienen límites." } },
      { "name": { "pt-BR": "VPS (Oracle Always Free, Hetzner)", "en": "VPS (Oracle Always Free, Hetzner)", "es": "VPS (Oracle Always Free, Hetzner)" },
        "why": { "pt-BR": "Controle total e custo baixo; você instala, atualiza e protege o servidor.", "en": "Full control and low cost; you install, update and secure the server.", "es": "Control total y bajo costo; tú instalas, actualizas y proteges el servidor." } },
      { "name": { "pt-BR": "Só local por enquanto", "en": "Local only for now", "es": "Solo local por ahora" },
        "why": { "pt-BR": "Roda com Sail na sua máquina; decide a hospedagem quando houver usuários.", "en": "Runs with Sail on your machine; choose hosting once there are users.", "es": "Corre con Sail en tu máquina; decide el hosting cuando haya usuarios." } }
    ],
    "backup": [
      { "name": { "pt-BR": "Backup diário automático do banco", "en": "Automatic daily database backup", "es": "Backup diario automático de la base" }, "recommended": true,
        "why": { "pt-BR": "Uma cópia diária de todos os dados do banco, guardada fora do servidor. A maioria das plataformas gerenciadas oferece; em VPS, um cron com pg_dump resolve.", "en": "A daily copy of all the database data, kept off the server. Most managed platforms offer it; on a VPS, a cron job with pg_dump does it.", "es": "Una copia diaria de todos los datos de la base, guardada fuera del servidor. La mayoría de las plataformas gestionadas lo ofrecen; en un VPS, un cron con pg_dump lo resuelve." } },
      { "name": { "pt-BR": "Manual por enquanto", "en": "Manual for now", "es": "Manual por ahora" }, "why": { "pt-BR": "Antes de uma mudança grande, você exporta o banco (pg_dump, mysqldump…) e guarda o arquivo fora do servidor. Serve enquanto ninguém depende do app.", "en": "Before a big change, you export the database (pg_dump, mysqldump…) and keep the file off the server. Fine while nobody depends on the app.", "es": "Antes de un cambio grande, exportas la base (pg_dump, mysqldump…) y guardas el archivo fuera del servidor. Sirve mientras nadie dependa de la app." } }
    ],
    "error-tracking": [
      { "name": "Sentry", "recommended": true,
        "why": { "pt-BR": "Avisa quando um erro acontece em produção, com a linha do código. Tem plano gratuito.", "en": "Alerts you when an error happens in production, with the line of code. Has a free plan.", "es": "Avisa cuando ocurre un error en producción, con la línea de código. Tiene plan gratuito." } },
      { "name": { "pt-BR": "Só logs por enquanto", "en": "Logs only for now", "es": "Solo logs por ahora" },
        "why": { "pt-BR": "Sem custo nem configuração; você só descobre o erro quando alguém reclama.", "en": "No cost or setup; you only learn about errors when someone complains.", "es": "Sin costo ni configuración; solo te enteras del error cuando alguien se queja." } }
    ]
  },

  "checklist": {
    "method": ["kanban", "conventional-commits"],
    "tools": ["git", "composer", "npm"],
    "ui": ["react-vite"],
    "app": ["laravel-app", "rest-api"],
    "data": ["database", "migrations"],
    "env": ["env-example", "environments"],
    "infra": ["hosting", "github-actions"],
    "security": ["sanctum", "https", "rate-limit", "backup"],
    "observability": ["logs", "error-tracking"]
  },

  "prepTrail": [
    { "title": { "pt-BR": "Instalar PHP e Composer", "en": "Install PHP and Composer", "es": "Instalar PHP y Composer" },
      "command": "php -v && composer -V",
      "ok": { "pt-BR": "O terminal mostra a versão do PHP e do Composer.", "en": "The terminal shows the PHP and Composer versions.", "es": "La terminal muestra las versiones de PHP y Composer." },
      "docs": "https://laravel.com/docs/installation" },
    { "title": { "pt-BR": "Criar o projeto", "en": "Create the project", "es": "Crear el proyecto" },
      "command": "composer create-project laravel/laravel meu-projeto",
      "ok": { "pt-BR": "A pasta meu-projeto tem o arquivo artisan.", "en": "The meu-projeto folder contains the artisan file.", "es": "La carpeta meu-projeto tiene el archivo artisan." } },
    { "title": { "pt-BR": "Instalar o front e rodar tudo", "en": "Install the front end and run everything", "es": "Instalar el front-end y ejecutar todo" },
      "command": "npm install && composer run dev",
      "ok": { "pt-BR": "localhost:8000 mostra a página inicial do Laravel.", "en": "localhost:8000 shows the Laravel welcome page.", "es": "localhost:8000 muestra la página de bienvenida de Laravel." } },
    { "title": { "pt-BR": "Primeiro teste passando", "en": "First test passing", "es": "Primera prueba pasando" },
      "command": "php artisan test",
      "ok": { "pt-BR": "O resumo mostra os testes em verde.", "en": "The summary shows the tests in green.", "es": "El resumen muestra las pruebas en verde." } }
  ],

  "folders": [
    { "path": "app/Models", "what": { "pt-BR": "Classes que representam as tabelas (Eloquent).", "en": "Classes that represent tables (Eloquent).", "es": "Clases que representan las tablas (Eloquent)." } },
    { "path": "app/Http/Controllers", "what": { "pt-BR": "Recebem as requisições e devolvem respostas.", "en": "Receive requests and return responses.", "es": "Reciben las peticiones y devuelven respuestas." } },
    { "path": "routes/api.php", "what": { "pt-BR": "Endereços da API que o React chama.", "en": "API endpoints the React app calls.", "es": "Endpoints de la API que llama React." } },
    { "path": "database/migrations", "what": { "pt-BR": "Mudanças do banco, em ordem.", "en": "Database changes, in order.", "es": "Cambios de la base, en orden." } },
    { "path": "resources/js", "what": { "pt-BR": "Código do front em React e TypeScript.", "en": "React and TypeScript front-end code.", "es": "Código del front-end en React y TypeScript." } },
    { "path": "tests", "what": { "pt-BR": "Testes automatizados.", "en": "Automated tests.", "es": "Pruebas automatizadas." } }
  ],
  "prerequisites": [
    "PHP",
    "Composer",
    "Node.js",
    "Git"
  ],
  "runLocally": {
    "install": [
      {
        "title": {
          "pt-BR": "Instale as dependências do PHP",
          "en": "Install the PHP dependencies",
          "es": "Instala las dependencias de PHP"
        },
        "command": "composer install"
      },
      {
        "title": {
          "pt-BR": "Instale as dependências do front",
          "en": "Install the front-end dependencies",
          "es": "Instala las dependencias del front"
        },
        "command": "npm install"
      }
    ],
    "run": [
      {
        "title": {
          "pt-BR": "Gere a chave da aplicação",
          "en": "Generate the application key",
          "es": "Genera la clave de la aplicación"
        },
        "command": "php artisan key:generate"
      },
      {
        "title": {
          "pt-BR": "Crie as tabelas do banco",
          "en": "Create the database tables",
          "es": "Crea las tablas de la base"
        },
        "command": "php artisan migrate"
      },
      {
        "title": {
          "pt-BR": "Rode o projeto",
          "en": "Run the project",
          "es": "Ejecuta el proyecto"
        },
        "command": "composer run dev"
      }
    ]
  },
  "dockerEnv": {
    "user": "DB_USERNAME",
    "password": "DB_PASSWORD",
    "database": "DB_DATABASE"
  },
  "gitignore": [
    "/vendor",
    "/node_modules",
    "/public/build",
    "/public/hot",
    "/public/storage",
    "/storage/*.key",
    ".env",
    ".env.backup",
    ".env.production",
    ".phpunit.result.cache",
    "npm-debug.log",
    "/.idea",
    "/.vscode",
    ".DS_Store"
  ],

  "envVars": [
    { "key": "APP_KEY", "secret": true, "usedIn": ["back"],
      "what": { "pt-BR": "Criptografa sessões e cookies.", "en": "Encrypts sessions and cookies.", "es": "Cifra sesiones y cookies." },
      "howToGet": { "pt-BR": "php artisan key:generate", "en": "php artisan key:generate", "es": "php artisan key:generate" } },
    { "key": "APP_ENV", "secret": false, "example": "local", "usedIn": ["back"],
      "what": { "pt-BR": "Ambiente atual: local ou production.", "en": "Current environment: local or production.", "es": "Entorno actual: local o production." } },
    { "key": "APP_URL", "secret": false, "example": "http://localhost:8000", "usedIn": ["back"],
      "what": { "pt-BR": "Endereço público do app.", "en": "Public address of the app.", "es": "Dirección pública de la app." } },
    { "key": "DB_CONNECTION", "secret": false, "example": "pgsql", "usedIn": ["back"],
      "what": { "pt-BR": "Qual banco o Laravel usa.", "en": "Which database Laravel uses.", "es": "Qué base de datos usa Laravel." } },
    { "key": "DB_HOST", "secret": false, "example": "127.0.0.1", "usedIn": ["back", "docker"],
      "what": { "pt-BR": "Endereço do banco.", "en": "Database host.", "es": "Dirección de la base de datos." } },
    { "key": "DB_DATABASE", "secret": false, "example": "meu_projeto", "usedIn": ["back", "docker"],
      "what": { "pt-BR": "Nome do banco.", "en": "Database name.", "es": "Nombre de la base de datos." } },
    { "key": "DB_USERNAME", "secret": false, "example": "sail", "usedIn": ["back", "docker"],
      "what": { "pt-BR": "Usuário do banco.", "en": "Database user.", "es": "Usuario de la base de datos." } },
    { "key": "DB_PASSWORD", "secret": true, "usedIn": ["back", "docker"],
      "what": { "pt-BR": "Senha do banco.", "en": "Database password.", "es": "Contraseña de la base de datos." },
      "howToGet": { "pt-BR": "Você define ao criar o banco; com Sail, o padrão local é password.", "en": "You set it when creating the database; with Sail the local default is password.", "es": "La defines al crear la base; con Sail el valor local por defecto es password." } },
    { "key": "VITE_API_URL", "secret": false, "example": "http://localhost:8000/api", "usedIn": ["front"],
      "what": { "pt-BR": "Endereço da API que o front chama. Fica visível no navegador.", "en": "API address the front end calls. Visible in the browser.", "es": "Dirección de la API que llama el front-end. Visible en el navegador." } }
  ],

  "equivalences": {
    "orm": "Eloquent",
    "migrate": "php artisan migrate",
    "routes": "routes/web.php, routes/api.php",
    "packages": "Composer",
    "devServer": "composer run dev",
    "config": ".env + config/",
    "templates": "Blade",
    "auth": "Sanctum / Breeze",
    "tests": "php artisan test"
  },

  "dependencyMap": {
    "laravel/framework": "laravel-app",
    "laravel/sanctum": "sanctum",
    "laravel/sail": "docker",
    "react": "react-vite",
    "vite": "react-vite",
    "tailwindcss": "tailwind",
    "sentry/sentry-laravel": "error-tracking"
  }
}
```

## Como validar um kit antes de entrar

- [ ] O schema aceita o arquivo (teste automático)
- [ ] Todos os textos existem em pt-BR e en
- [ ] Todo item `pending` tem `pendingOptions` com uma `recommended`
- [ ] Todo id de `runsOn` é um item `pending` com `pendingOptions`
- [ ] Todo id em `checklist`, `connections`, `flows` e `dependencyMap` existe em `items`
- [ ] Nenhuma variável `secret: true` tem `example`
- [ ] Os comandos da `prepTrail` foram executados numa máquina limpa e funcionam
- [ ] Os passos de `runLocally` funcionam num clone do repositório gerado
- [ ] O `gitignore` ignora `.env` e não ignora `.env.example`
- [ ] Os links de documentação abrem a página oficial certa
