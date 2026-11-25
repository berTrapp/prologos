# Kit — Node + React

Segue o formato do *Kit modelo — Laravel + React* (`docs/kits/laravel-react.md`). No repositório: `src/content/kits/node-react.json`.

- **Tipos de projeto:** web, api
- **Recomendado quando a pessoa domina:** node
- **Prefixo de variável pública:** `VITE_`
- **Arquivos que a leitura do GitHub usa:** `package.json`, `.env.example`, `docker-compose.yml`
- **Itens:** 24 · pendentes no início: database, hosting, backup, error-tracking
- **Trilha "Preparar o ambiente":** 5 passos
- **Equivalências:** sim

Validado automaticamente: referências entre itens, uma opção recomendada por pendência, nenhum segredo com exemplo ou com prefixo público, textos em pt-BR, en e es. Os comandos e links precisam ser conferidos numa máquina limpa antes de cada release (lista de validação do kit modelo).

```json
{
  "id": "node-react",
  "version": "1.0.0",
  "name": {
    "pt-BR": "Node + React",
    "en": "Node + React",
    "es": "Node + React"
  },
  "summary": {
    "pt-BR": "TypeScript nas duas pontas: API em Node com Express e interface em React com Vite.",
    "en": "TypeScript end to end: a Node API with Express and a React interface with Vite.",
    "es": "TypeScript en ambos lados: API en Node con Express e interfaz en React con Vite."
  },
  "projectTypes": [
    "web",
    "api"
  ],
  "knownStack": "node",
  "publicEnvPrefix": "VITE_",
  "runsOn": [
    "database",
    "hosting"
  ],
  "dependencyFiles": [
    "package.json",
    ".env.example",
    "docker-compose.yml"
  ],
  "technologies": [
    {
      "id": "ts",
      "name": "TypeScript",
      "what": {
        "pt-BR": "JavaScript com tipos, usado no back e no front.",
        "en": "JavaScript with types, used on both back and front end.",
        "es": "JavaScript con tipos, usado en el back y el front."
      },
      "docs": "https://www.typescriptlang.org/docs/"
    },
    {
      "id": "node",
      "name": "Node.js",
      "what": {
        "pt-BR": "Roda JavaScript fora do navegador, no servidor.",
        "en": "Runs JavaScript outside the browser, on the server.",
        "es": "Ejecuta JavaScript fuera del navegador, en el servidor."
      },
      "docs": "https://nodejs.org/docs/latest/api/"
    },
    {
      "id": "express",
      "name": "Express",
      "what": {
        "pt-BR": "Framework mínimo de rotas e middlewares para APIs.",
        "en": "Minimal routing and middleware framework for APIs.",
        "es": "Framework mínimo de rutas y middlewares para APIs."
      },
      "docs": "https://expressjs.com"
    },
    {
      "id": "react",
      "name": "React",
      "what": {
        "pt-BR": "Biblioteca para montar a interface em componentes.",
        "en": "Library for building the interface out of components.",
        "es": "Biblioteca para construir la interfaz con componentes."
      },
      "docs": "https://react.dev"
    },
    {
      "id": "prisma",
      "name": "Prisma",
      "what": {
        "pt-BR": "ORM com tipos gerados a partir do schema do banco.",
        "en": "ORM with types generated from the database schema.",
        "es": "ORM con tipos generados a partir del esquema de la base."
      },
      "docs": "https://www.prisma.io/docs"
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
      "id": "npm",
      "zone": "tools",
      "name": "npm",
      "state": "decided",
      "when": "now",
      "concept": "packages",
      "tech": "node",
      "why": {
        "pt-BR": "Instala os pacotes das duas pontas.",
        "en": "Installs packages for both ends.",
        "es": "Instala los paquetes de ambos lados."
      }
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
      "id": "vitest",
      "zone": "tools",
      "name": "Vitest",
      "state": "decided",
      "when": "now",
      "concept": "tests",
      "tech": "ts",
      "why": {
        "pt-BR": "Testes rápidos com a mesma configuração do Vite.",
        "en": "Fast tests sharing Vite's configuration.",
        "es": "Pruebas rápidas con la misma configuración de Vite."
      },
      "docs": "https://vitest.dev"
    },
    {
      "id": "react-vite",
      "zone": "ui",
      "name": "React + Vite",
      "state": "decided",
      "when": "now",
      "tech": "react",
      "why": {
        "pt-BR": "Interface em componentes, com recarga instantânea.",
        "en": "Component-based interface with instant reload.",
        "es": "Interfaz en componentes, con recarga instantánea."
      },
      "docs": "https://vite.dev/guide/"
    },
    {
      "id": "tailwind",
      "zone": "ui",
      "name": "Tailwind CSS",
      "state": "decided",
      "when": "now",
      "docs": "https://tailwindcss.com/docs"
    },
    {
      "id": "express-api",
      "zone": "app",
      "name": "Express",
      "state": "decided",
      "when": "now",
      "tech": "express",
      "why": {
        "pt-BR": "Recebe as requisições do front, aplica as regras e responde em JSON.",
        "en": "Receives front-end requests, applies rules and replies in JSON.",
        "es": "Recibe las peticiones del front, aplica las reglas y responde en JSON."
      }
    },
    {
      "id": "rest-api",
      "zone": "app",
      "name": "API REST",
      "state": "decided",
      "when": "now",
      "concept": "routes",
      "tech": "express",
      "why": {
        "pt-BR": "O front conversa com a API por rotas em /api.",
        "en": "The front end talks to the API through routes under /api.",
        "es": "El front habla con la API mediante rutas en /api."
      }
    },
    {
      "id": "validation",
      "zone": "app",
      "name": "Zod",
      "state": "decided",
      "when": "now",
      "tech": "ts",
      "why": {
        "pt-BR": "Valida o que chega na API e gera os tipos.",
        "en": "Validates what reaches the API and derives types.",
        "es": "Valida lo que llega a la API y genera los tipos."
      },
      "docs": "https://zod.dev"
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
      "id": "prisma",
      "zone": "data",
      "name": "Prisma",
      "state": "decided",
      "when": "now",
      "concept": "orm",
      "tech": "prisma",
      "why": {
        "pt-BR": "Tabelas viram modelos com tipos; evita SQL na mão para o básico.",
        "en": "Tables become typed models; avoids hand-written SQL for the basics.",
        "es": "Las tablas se vuelven modelos tipados; evita SQL a mano para lo básico."
      },
      "docs": "https://www.prisma.io/docs"
    },
    {
      "id": "migrations",
      "zone": "data",
      "name": "Prisma Migrate",
      "state": "decided",
      "when": "now",
      "concept": "migrate",
      "tech": "prisma",
      "why": {
        "pt-BR": "Mudanças do banco em arquivos, em ordem.",
        "en": "Database changes as ordered files.",
        "es": "Cambios de la base en archivos ordenados."
      }
    },
    {
      "id": "env-example",
      "zone": "env",
      "name": ".env.example",
      "state": "decided",
      "when": "now",
      "concept": "config",
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
      "name": "Auth.js",
      "state": "decided",
      "when": "now",
      "concept": "auth",
      "why": {
        "pt-BR": "Login com e-mail ou provedores (GitHub, Google) sem escrever criptografia na mão.",
        "en": "Login with email or providers (GitHub, Google) without hand-written crypto.",
        "es": "Inicio de sesión con correo o proveedores (GitHub, Google) sin criptografía a mano."
      },
      "docs": "https://authjs.dev"
    },
    {
      "id": "https",
      "zone": "security",
      "name": "HTTPS",
      "state": "decided",
      "when": "now"
    },
    {
      "id": "helmet",
      "zone": "security",
      "name": "Helmet + rate limit",
      "state": "decided",
      "when": "now",
      "tech": "express",
      "why": {
        "pt-BR": "Cabeçalhos de segurança e limite de tentativas na API.",
        "en": "Security headers and request limits on the API.",
        "es": "Cabeceras de seguridad y límite de intentos en la API."
      },
      "docs": "https://helmetjs.github.io"
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
      "name": "Logs (pino)",
      "state": "decided",
      "when": "now",
      "docs": "https://getpino.io"
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
      "from": "react-vite",
      "to": "rest-api",
      "type": "calls"
    },
    {
      "from": "rest-api",
      "to": "express-api",
      "type": "uses"
    },
    {
      "from": "express-api",
      "to": "prisma",
      "type": "uses"
    },
    {
      "from": "prisma",
      "to": "database",
      "type": "writes-to"
    },
    {
      "from": "auth",
      "to": "rest-api",
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
        "pt-BR": "Salvar um registro",
        "en": "Save a record",
        "es": "Guardar un registro"
      },
      "path": [
        "react-vite",
        "rest-api",
        "express-api",
        "prisma",
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
          "pt-BR": "Plataforma gerenciada (Render, Railway)",
          "en": "Managed platform (Render, Railway)",
          "es": "Plataforma gestionada (Render, Railway)"
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
          "pt-BR": "Avisa quando um erro acontece em produção, com a linha do código (@sentry/node). Tem plano gratuito.",
          "en": "Alerts you when an error happens in production, with the line of code (@sentry/node). Has a free plan.",
          "es": "Avisa cuando ocurre un error en producción, con la línea de código (@sentry/node). Tiene plan gratuito."
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
      "npm",
      "vitest"
    ],
    "ui": [
      "react-vite"
    ],
    "app": [
      "express-api",
      "rest-api",
      "validation"
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
      "helmet",
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
        "pt-BR": "Instalar o Node.js (versão LTS)",
        "en": "Install Node.js (LTS version)",
        "es": "Instalar Node.js (versión LTS)"
      },
      "command": "node -v && npm -v",
      "ok": {
        "pt-BR": "O terminal mostra a versão do Node e do npm.",
        "en": "The terminal shows the Node and npm versions.",
        "es": "La terminal muestra las versiones de Node y npm."
      },
      "docs": "https://nodejs.org/en/download"
    },
    {
      "title": {
        "pt-BR": "Criar o front",
        "en": "Create the front end",
        "es": "Crear el front-end"
      },
      "command": "npm create vite@latest web -- --template react-ts",
      "ok": {
        "pt-BR": "A pasta web/ tem package.json e src/App.tsx.",
        "en": "The web/ folder has package.json and src/App.tsx.",
        "es": "La carpeta web/ tiene package.json y src/App.tsx."
      }
    },
    {
      "title": {
        "pt-BR": "Criar a API",
        "en": "Create the API",
        "es": "Crear la API"
      },
      "command": "mkdir api && cd api && npm init -y && npm i express && npm i -D typescript tsx @types/express vitest",
      "ok": {
        "pt-BR": "A pasta api/ tem package.json com express e vitest.",
        "en": "The api/ folder has package.json with express and vitest.",
        "es": "La carpeta api/ tiene package.json con express y vitest."
      }
    },
    {
      "title": {
        "pt-BR": "Rodar o front",
        "en": "Run the front end",
        "es": "Ejecutar el front-end"
      },
      "command": "cd web && npm install && npm run dev",
      "ok": {
        "pt-BR": "localhost:5173 mostra a página do React.",
        "en": "localhost:5173 shows the React page.",
        "es": "localhost:5173 muestra la página de React."
      }
    },
    {
      "title": {
        "pt-BR": "Deixar os testes prontos",
        "en": "Get the tests ready",
        "es": "Dejar las pruebas listas"
      },
      "command": "cd api && npx vitest run --passWithNoTests",
      "ok": {
        "pt-BR": "O Vitest roda e termina sem erro. O primeiro teste você escreve junto com a primeira rota.",
        "en": "Vitest runs and finishes without errors. You write the first test along with the first route.",
        "es": "Vitest se ejecuta y termina sin errores. La primera prueba la escribes junto con la primera ruta."
      }
    }
  ],
  "folders": [
    {
      "path": "web/src",
      "what": {
        "pt-BR": "Código do front em React.",
        "en": "React front-end code.",
        "es": "Código del front-end en React."
      }
    },
    {
      "path": "api/src/routes",
      "what": {
        "pt-BR": "Rotas da API, uma por assunto.",
        "en": "API routes, one per topic.",
        "es": "Rutas de la API, una por tema."
      }
    },
    {
      "path": "api/src/services",
      "what": {
        "pt-BR": "Regras de negócio, sem saber de HTTP.",
        "en": "Business rules, unaware of HTTP.",
        "es": "Reglas de negocio, sin saber de HTTP."
      }
    },
    {
      "path": "api/prisma/schema.prisma",
      "what": {
        "pt-BR": "Modelo do banco e migrations.",
        "en": "Database model and migrations.",
        "es": "Modelo de la base y migraciones."
      }
    },
    {
      "path": "api/tests",
      "what": {
        "pt-BR": "Testes da API.",
        "en": "API tests.",
        "es": "Pruebas de la API."
      }
    }
  ],
  "envVars": [
    {
      "key": "PORT",
      "secret": false,
      "example": "3000",
      "usedIn": [
        "back"
      ],
      "what": {
        "pt-BR": "Porta da API.",
        "en": "API port.",
        "es": "Puerto de la API."
      }
    },
    {
      "key": "DATABASE_URL",
      "secret": true,
      "usedIn": [
        "back",
        "docker"
      ],
      "what": {
        "pt-BR": "Endereço completo do banco, com usuário e senha.",
        "en": "Full database address, with user and password.",
        "es": "Dirección completa de la base, con usuario y contraseña."
      },
      "howToGet": {
        "pt-BR": "Montado a partir do banco que você criar: postgresql://usuario:senha@host:5432/nome",
        "en": "Built from the database you create: postgresql://user:password@host:5432/name",
        "es": "Se arma con la base que crees: postgresql://usuario:clave@host:5432/nombre"
      }
    },
    {
      "key": "AUTH_SECRET",
      "secret": true,
      "usedIn": [
        "back"
      ],
      "what": {
        "pt-BR": "Assina as sessões de login.",
        "en": "Signs login sessions.",
        "es": "Firma las sesiones de inicio."
      },
      "howToGet": {
        "pt-BR": "npx auth secret",
        "en": "npx auth secret",
        "es": "npx auth secret"
      }
    },
    {
      "key": "VITE_API_URL",
      "secret": false,
      "example": "http://localhost:3000/api",
      "usedIn": [
        "front"
      ],
      "what": {
        "pt-BR": "Endereço da API que o front chama. Fica visível no navegador.",
        "en": "API address the front end calls. Visible in the browser.",
        "es": "Dirección de la API que llama el front. Visible en el navegador."
      }
    }
  ],
  "equivalences": {
    "orm": "Prisma",
    "migrate": "npx prisma migrate dev",
    "routes": "express.Router()",
    "packages": "npm",
    "devServer": "npm run dev",
    "config": ".env + process.env",
    "templates": "React (JSX)",
    "auth": "Auth.js",
    "tests": "npx vitest"
  },
  "dependencyMap": {
    "express": "express-api",
    "@prisma/client": "prisma",
    "prisma": "migrations",
    "react": "react-vite",
    "vite": "react-vite",
    "zod": "validation",
    "next-auth": "auth",
    "@auth/express": "auth",
    "helmet": "helmet",
    "pino": "logs",
    "@sentry/node": "error-tracking",
    "tailwindcss": "tailwind",
    "vitest": "vitest"
  }
}
```
