# Kit — Site estático (Astro)

Segue o formato do *Kit modelo — Laravel + React* (`docs/kits/laravel-react.md`). No repositório: `src/content/kits/static-astro.json`.

- **Tipos de projeto:** site
- **Recomendado quando a pessoa domina:** —
- **Prefixo de variável pública:** `PUBLIC_`
- **Arquivos que a leitura do GitHub usa:** `package.json`, `.env.example`
- **Itens:** 13 · pendentes no início: forms, hosting, domain, analytics
- **Trilha "Preparar o ambiente":** 4 passos
- **Equivalências:** não (kit sem par direto entre as stacks web)

Validado automaticamente: referências entre itens, uma opção recomendada por pendência, nenhum segredo com exemplo ou com prefixo público, textos em pt-BR, en e es. Os comandos e links precisam ser conferidos numa máquina limpa antes de cada release (lista de validação do kit modelo).

```json
{
  "id": "static-astro",
  "version": "1.0.0",
  "name": {
    "pt-BR": "Site estático",
    "en": "Static site",
    "es": "Sitio estático"
  },
  "summary": {
    "pt-BR": "Páginas rápidas geradas com Astro, publicadas sem servidor.",
    "en": "Fast pages generated with Astro, published without a server.",
    "es": "Páginas rápidas generadas con Astro, publicadas sin servidor."
  },
  "projectTypes": [
    "site"
  ],
  "knownStack": null,
  "publicEnvPrefix": "PUBLIC_",
  "runsOn": ["hosting", "domain"],
  "dependencyFiles": [
    "package.json",
    ".env.example"
  ],
  "technologies": [
    {
      "id": "astro",
      "name": "Astro",
      "what": {
        "pt-BR": "Gera o site a partir de componentes e Markdown, com quase nada de JavaScript no navegador.",
        "en": "Builds the site from components and Markdown, with almost no JavaScript in the browser.",
        "es": "Genera el sitio a partir de componentes y Markdown, casi sin JavaScript en el navegador."
      },
      "docs": "https://docs.astro.build"
    },
    {
      "id": "html",
      "name": "HTML e CSS",
      "what": {
        "pt-BR": "Estrutura e estilo das páginas.",
        "en": "Page structure and style.",
        "es": "Estructura y estilo de las páginas."
      },
      "docs": "https://developer.mozilla.org/docs/Web/HTML"
    },
    {
      "id": "md",
      "name": "Markdown",
      "what": {
        "pt-BR": "Texto das páginas e posts, simples de escrever.",
        "en": "Page and post text, simple to write.",
        "es": "Texto de páginas y posts, simple de escribir."
      },
      "docs": "https://docs.astro.build/en/guides/markdown-content/"
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
      "when": "now"
    },
    {
      "id": "astro-ui",
      "zone": "ui",
      "name": "Astro",
      "state": "decided",
      "when": "now",
      "tech": "astro",
      "why": {
        "pt-BR": "Componentes .astro montam as páginas na hora do build.",
        "en": ".astro components build the pages at build time.",
        "es": "Los componentes .astro arman las páginas en el build."
      }
    },
    {
      "id": "css",
      "zone": "ui",
      "name": {
        "pt-BR": "CSS do Astro (com escopo)",
        "en": "Astro scoped CSS",
        "es": "CSS de Astro (con alcance)"
      },
      "state": "decided",
      "when": "now",
      "tech": "html",
      "docs": "https://docs.astro.build/en/guides/styling/"
    },
    {
      "id": "content",
      "zone": "app",
      "name": "Content Collections",
      "state": "decided",
      "when": "now",
      "tech": "md",
      "why": {
        "pt-BR": "Posts e páginas em Markdown, com campos validados.",
        "en": "Posts and pages in Markdown, with validated fields.",
        "es": "Posts y páginas en Markdown, con campos validados."
      },
      "docs": "https://docs.astro.build/en/guides/content-collections/"
    },
    {
      "id": "forms",
      "zone": "app",
      "name": {
        "pt-BR": "Formulário de contato",
        "en": "Contact form",
        "es": "Formulario de contacto"
      },
      "state": "pending",
      "when": "later"
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
      "id": "domain",
      "zone": "infra",
      "name": {
        "pt-BR": "Domínio próprio",
        "en": "Custom domain",
        "es": "Dominio propio"
      },
      "state": "pending",
      "when": "later"
    },
    {
      "id": "https",
      "zone": "security",
      "name": "HTTPS",
      "state": "decided",
      "when": "now"
    },
    {
      "id": "analytics",
      "zone": "observability",
      "name": {
        "pt-BR": "Estatísticas de visita",
        "en": "Visit analytics",
        "es": "Estadísticas de visitas"
      },
      "state": "pending",
      "when": "later"
    }
  ],
  "connections": [
    {
      "from": "content",
      "to": "astro-ui",
      "type": "rendered-by"
    },
    {
      "from": "github-actions",
      "to": "hosting",
      "type": "deploys-to"
    }
  ],
  "flows": [
    {
      "id": "publish",
      "name": {
        "pt-BR": "Publicar um post",
        "en": "Publish a post",
        "es": "Publicar un post"
      },
      "path": [
        "content",
        "astro-ui"
      ]
    }
  ],
  "pendingOptions": {
    "hosting": [
      {
        "name": "Cloudflare Pages",
        "recommended": true,
        "why": {
          "pt-BR": "Gratuito, rápido no Brasil e deploy direto do GitHub.",
          "en": "Free, fast worldwide and deploys straight from GitHub.",
          "es": "Gratuito, rápido y deploy directo desde GitHub."
        }
      },
      {
        "name": "GitHub Pages",
        "why": {
          "pt-BR": "Gratuito e no mesmo lugar do código; menos opções de configuração.",
          "en": "Free and next to the code; fewer configuration options.",
          "es": "Gratuito y junto al código; menos opciones de configuración."
        }
      },
      {
        "name": "Netlify / Vercel",
        "why": {
          "pt-BR": "Gratuitos com limites; bons recursos de pré-visualização por PR.",
          "en": "Free with limits; good per-PR preview features.",
          "es": "Gratuitos con límites; buenas vistas previas por PR."
        }
      }
    ],
    "forms": [
      {
        "name": "Formspree",
        "recommended": true,
        "why": {
          "pt-BR": "Recebe o formulário e manda para o seu e-mail, sem servidor.",
          "en": "Receives the form and emails it to you, no server.",
          "es": "Recibe el formulario y lo envía a tu correo, sin servidor."
        }
      },
      {
        "name": {
          "pt-BR": "Link de e-mail (mailto)",
          "en": "Email link (mailto)",
          "es": "Enlace de correo (mailto)"
        },
        "why": {
          "pt-BR": "Zero configuração; a pessoa precisa de um app de e-mail.",
          "en": "Zero setup; the visitor needs an email app.",
          "es": "Cero configuración; la persona necesita una app de correo."
        }
      }
    ],
    "domain": [
      {
        "name": {
          "pt-BR": "Registro.br (.com.br)",
          "en": "Any registrar (.com)",
          "es": "Cualquier registrador (.com)"
        },
        "recommended": true,
        "why": {
          "pt-BR": "Domínio .com.br com anuidade baixa; aponte o DNS para a hospedagem.",
          "en": "Buy a domain and point its DNS to the host.",
          "es": "Compra un dominio y apunta su DNS al hosting."
        }
      }
    ],
    "analytics": [
      {
        "name": "Cloudflare Web Analytics",
        "recommended": true,
        "why": {
          "pt-BR": "Gratuito e sem cookies.",
          "en": "Free and cookie-free.",
          "es": "Gratuito y sin cookies."
        }
      },
      {
        "name": "Plausible",
        "why": {
          "pt-BR": "Simples e respeita a privacidade; pago.",
          "en": "Simple and privacy-friendly; paid.",
          "es": "Simple y respeta la privacidad; de pago."
        }
      }
    ]
  },
  "checklist": {
    "method": [
      "conventional-commits"
    ],
    "tools": [
      "git",
      "npm"
    ],
    "ui": [
      "astro-ui"
    ],
    "app": [
      "content"
    ],
    "env": [
      "env-example"
    ],
    "infra": [
      "hosting",
      "github-actions"
    ],
    "security": [
      "https"
    ],
    "observability": [
      "analytics"
    ]
  },
  "prepTrail": [
    {
      "title": {
        "pt-BR": "Instalar o Node.js (versão LTS)",
        "en": "Install Node.js (LTS version)",
        "es": "Instalar Node.js (versión LTS)"
      },
      "command": "node -v",
      "ok": {
        "pt-BR": "O terminal mostra a versão do Node.",
        "en": "The terminal shows the Node version.",
        "es": "La terminal muestra la versión de Node."
      },
      "docs": "https://nodejs.org/en/download"
    },
    {
      "title": {
        "pt-BR": "Criar o site",
        "en": "Create the site",
        "es": "Crear el sitio"
      },
      "command": "npm create astro@latest",
      "ok": {
        "pt-BR": "A pasta do site tem src/pages/index.astro.",
        "en": "The site folder has src/pages/index.astro.",
        "es": "La carpeta del sitio tiene src/pages/index.astro."
      },
      "docs": "https://docs.astro.build/en/install-and-setup/"
    },
    {
      "title": {
        "pt-BR": "Rodar localmente",
        "en": "Run locally",
        "es": "Ejecutar localmente"
      },
      "command": "npm run dev",
      "ok": {
        "pt-BR": "localhost:4321 mostra a página inicial.",
        "en": "localhost:4321 shows the home page.",
        "es": "localhost:4321 muestra la página de inicio."
      }
    },
    {
      "title": {
        "pt-BR": "Gerar a versão publicável",
        "en": "Build the publishable version",
        "es": "Generar la versión publicable"
      },
      "command": "npm run build",
      "ok": {
        "pt-BR": "A pasta dist/ tem os arquivos HTML do site.",
        "en": "The dist/ folder has the site's HTML files.",
        "es": "La carpeta dist/ tiene los archivos HTML del sitio."
      }
    }
  ],
  "folders": [
    {
      "path": "src/pages/",
      "what": {
        "pt-BR": "Cada arquivo vira uma página do site.",
        "en": "Each file becomes a site page.",
        "es": "Cada archivo se vuelve una página del sitio."
      }
    },
    {
      "path": "src/components/",
      "what": {
        "pt-BR": "Peças reutilizáveis (cabeçalho, rodapé, cards).",
        "en": "Reusable pieces (header, footer, cards).",
        "es": "Piezas reutilizables (encabezado, pie, tarjetas)."
      }
    },
    {
      "path": "src/content/",
      "what": {
        "pt-BR": "Posts e textos em Markdown.",
        "en": "Posts and text in Markdown.",
        "es": "Posts y textos en Markdown."
      }
    },
    {
      "path": "public/",
      "what": {
        "pt-BR": "Imagens e arquivos copiados como estão.",
        "en": "Images and files copied as-is.",
        "es": "Imágenes y archivos copiados tal cual."
      }
    },
    {
      "path": "dist/",
      "what": {
        "pt-BR": "Site gerado para publicar (não vai para o Git).",
        "en": "Generated site to publish (not committed).",
        "es": "Sitio generado para publicar (no va al Git)."
      }
    }
  ],
  "prerequisites": [
    "Node.js",
    "Git"
  ],
  "runLocally": {
    "install": [
      {
        "title": {
          "pt-BR": "Instale as dependências",
          "en": "Install the dependencies",
          "es": "Instala las dependencias"
        },
        "command": "npm install"
      }
    ],
    "run": [
      {
        "title": {
          "pt-BR": "Rode o site",
          "en": "Run the site",
          "es": "Ejecuta el sitio"
        },
        "command": "npm run dev"
      }
    ]
  },
  "gitignore": [
    "node_modules/",
    "dist/",
    ".astro/",
    ".env",
    ".env.production",
    "npm-debug.log*",
    ".DS_Store"
  ],
  "envVars": [
    {
      "key": "PUBLIC_SITE_URL",
      "secret": false,
      "example": "https://meusite.com.br",
      "usedIn": [
        "front"
      ],
      "what": {
        "pt-BR": "Endereço final do site, usado em links e SEO. Fica visível no navegador.",
        "en": "Final site address, used in links and SEO. Visible in the browser.",
        "es": "Dirección final del sitio, usada en enlaces y SEO. Visible en el navegador."
      }
    }
  ],
  "equivalences": {},
  "dependencyMap": {
    "astro": "astro-ui",
    "@astrojs/mdx": "content"
  }
}
```
