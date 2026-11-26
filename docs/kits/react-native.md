# Kit — React Native (Expo)

Segue o formato do *Kit modelo — Laravel + React* (`docs/kits/laravel-react.md`). No repositório: `src/content/kits/react-native.json`.

- **Tipos de projeto:** mobile
- **Recomendado quando a pessoa domina:** —
- **Prefixo de variável pública:** `EXPO_PUBLIC_`
- **Arquivos que a leitura do GitHub usa:** `package.json`, `app.json`, `eas.json`, `.env.example`
- **Itens:** 18 · pendentes no início: backend, stores, error-tracking
- **Trilha "Preparar o ambiente":** 4 passos
- **Equivalências:** não (kit sem par direto entre as stacks web)

Validado automaticamente: referências entre itens, uma opção recomendada por pendência, nenhum segredo com exemplo ou com prefixo público, textos em pt-BR, en e es. Os comandos e links precisam ser conferidos numa máquina limpa antes de cada release (lista de validação do kit modelo).

```json
{
  "id": "react-native",
  "version": "1.0.0",
  "name": {
    "pt-BR": "React Native (Expo)",
    "en": "React Native (Expo)",
    "es": "React Native (Expo)"
  },
  "summary": {
    "pt-BR": "App para Android e iOS em TypeScript, com Expo para rodar, testar e publicar.",
    "en": "Android and iOS app in TypeScript, with Expo to run, test and publish.",
    "es": "App para Android e iOS en TypeScript, con Expo para ejecutar, probar y publicar."
  },
  "projectTypes": [
    "mobile"
  ],
  "knownStack": null,
  "publicEnvPrefix": "EXPO_PUBLIC_",
  "runsOn": ["backend", "stores"],
  "dependencyFiles": [
    "package.json",
    "app.json",
    "eas.json",
    ".env.example"
  ],
  "technologies": [
    {
      "id": "ts",
      "name": "TypeScript",
      "what": {
        "pt-BR": "JavaScript com tipos.",
        "en": "JavaScript with types.",
        "es": "JavaScript con tipos."
      },
      "docs": "https://www.typescriptlang.org/docs/"
    },
    {
      "id": "rn",
      "name": "React Native",
      "what": {
        "pt-BR": "Interface nativa de Android e iOS escrita em React.",
        "en": "Native Android and iOS interface written in React.",
        "es": "Interfaz nativa de Android e iOS escrita en React."
      },
      "docs": "https://reactnative.dev/docs/getting-started"
    },
    {
      "id": "expo",
      "name": "Expo",
      "what": {
        "pt-BR": "Ferramentas para rodar no celular, acessar recursos do aparelho e publicar nas lojas.",
        "en": "Tools to run on the phone, use device features and publish to the stores.",
        "es": "Herramientas para ejecutar en el celular, usar funciones del dispositivo y publicar en las tiendas."
      },
      "docs": "https://docs.expo.dev"
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
      "tech": "ts"
    },
    {
      "id": "expo-go",
      "zone": "tools",
      "name": "Expo Go",
      "state": "decided",
      "when": "now",
      "tech": "expo",
      "why": {
        "pt-BR": "Abre o app no seu celular lendo um QR code, sem instalar Android Studio.",
        "en": "Opens the app on your phone by scanning a QR code, without installing Android Studio.",
        "es": "Abre la app en tu celular leyendo un código QR, sin instalar Android Studio."
      },
      "docs": "https://docs.expo.dev/get-started/expo-go/"
    },
    {
      "id": "jest",
      "zone": "tools",
      "name": "Jest + Testing Library",
      "state": "decided",
      "when": "now",
      "tech": "ts",
      "docs": "https://docs.expo.dev/develop/unit-testing/"
    },
    {
      "id": "rn-ui",
      "zone": "ui",
      "name": "React Native",
      "state": "decided",
      "when": "now",
      "tech": "rn",
      "why": {
        "pt-BR": "Componentes que viram telas nativas de verdade.",
        "en": "Components that become real native screens.",
        "es": "Componentes que se vuelven pantallas nativas reales."
      }
    },
    {
      "id": "expo-router",
      "zone": "ui",
      "name": "Expo Router",
      "state": "decided",
      "when": "now",
      "tech": "expo",
      "why": {
        "pt-BR": "Navegação entre telas a partir das pastas, como em sites.",
        "en": "Navigation between screens based on folders, like websites.",
        "es": "Navegación entre pantallas a partir de las carpetas, como en sitios web."
      },
      "docs": "https://docs.expo.dev/router/introduction/"
    },
    {
      "id": "backend",
      "zone": "app",
      "name": {
        "pt-BR": "Back-end (API)",
        "en": "Back end (API)",
        "es": "Back-end (API)"
      },
      "state": "pending",
      "when": "now",
      "why": {
        "pt-BR": "O app precisa de um servidor para dados compartilhados e login.",
        "en": "The app needs a server for shared data and login.",
        "es": "La app necesita un servidor para datos compartidos e inicio de sesión."
      }
    },
    {
      "id": "local-storage",
      "zone": "data",
      "name": "expo-sqlite",
      "state": "decided",
      "when": "now",
      "tech": "expo",
      "why": {
        "pt-BR": "Guarda dados no próprio aparelho, inclusive sem internet.",
        "en": "Stores data on the device itself, even offline.",
        "es": "Guarda datos en el propio dispositivo, incluso sin internet."
      },
      "docs": "https://docs.expo.dev/versions/latest/sdk/sqlite/"
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
      "id": "eas",
      "zone": "infra",
      "name": "EAS Build + Submit",
      "state": "decided",
      "when": "now",
      "tech": "expo",
      "why": {
        "pt-BR": "Gera os instaladores e envia para Google Play e App Store.",
        "en": "Builds installers and submits to Google Play and the App Store.",
        "es": "Genera los instaladores y los envía a Google Play y App Store."
      },
      "docs": "https://docs.expo.dev/eas/"
    },
    {
      "id": "stores",
      "zone": "infra",
      "name": {
        "pt-BR": "Contas nas lojas",
        "en": "Store accounts",
        "es": "Cuentas en las tiendas"
      },
      "state": "pending",
      "when": "later"
    },
    {
      "id": "secure-store",
      "zone": "security",
      "name": "expo-secure-store",
      "state": "decided",
      "when": "now",
      "tech": "expo",
      "why": {
        "pt-BR": "Guarda tokens de login criptografados no aparelho.",
        "en": "Stores login tokens encrypted on the device.",
        "es": "Guarda tokens de inicio cifrados en el dispositivo."
      },
      "docs": "https://docs.expo.dev/versions/latest/sdk/securestore/"
    },
    {
      "id": "https",
      "zone": "security",
      "name": "HTTPS",
      "state": "decided",
      "when": "now"
    },
    {
      "id": "logs",
      "zone": "observability",
      "name": {
        "pt-BR": "Logs no Expo",
        "en": "Logs in Expo",
        "es": "Logs en Expo"
      },
      "state": "decided",
      "when": "now",
      "tech": "expo"
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
      "from": "expo-router",
      "to": "rn-ui",
      "type": "uses"
    },
    {
      "from": "rn-ui",
      "to": "backend",
      "type": "calls"
    },
    {
      "from": "rn-ui",
      "to": "local-storage",
      "type": "writes-to"
    },
    {
      "from": "secure-store",
      "to": "backend",
      "type": "protects"
    },
    {
      "from": "eas",
      "to": "stores",
      "type": "deploys-to"
    }
  ],
  "flows": [
    {
      "id": "save",
      "name": {
        "pt-BR": "Salvar e sincronizar",
        "en": "Save and sync",
        "es": "Guardar y sincronizar"
      },
      "path": [
        "rn-ui",
        "local-storage"
      ]
    }
  ],
  "pendingOptions": {
    "backend": [
      {
        "name": "Supabase",
        "recommended": true,
        "why": {
          "pt-BR": "Banco PostgreSQL, login e armazenamento prontos, com SDK para React Native. Plano gratuito.",
          "en": "PostgreSQL database, auth and storage ready, with a React Native SDK. Free plan.",
          "es": "Base PostgreSQL, inicio de sesión y almacenamiento listos, con SDK para React Native. Plan gratuito."
        }
      },
      {
        "name": {
          "pt-BR": "API própria (um dos kits web)",
          "en": "Your own API (one of the web kits)",
          "es": "API propia (uno de los kits web)"
        },
        "why": {
          "pt-BR": "Mais controle; crie um segundo projeto no Prólogos com o kit da sua stack.",
          "en": "More control; create a second Prólogos project with your stack's kit.",
          "es": "Más control; crea un segundo proyecto en Prólogos con el kit de tu stack."
        }
      },
      {
        "name": {
          "pt-BR": "Só no aparelho por enquanto",
          "en": "On-device only for now",
          "es": "Solo en el dispositivo por ahora"
        },
        "why": {
          "pt-BR": "Sem servidor: cada pessoa vê só os próprios dados.",
          "en": "No server: each person sees only their own data.",
          "es": "Sin servidor: cada persona ve solo sus propios datos."
        }
      }
    ],
    "stores": [
      {
        "name": {
          "pt-BR": "Começar só com Android",
          "en": "Start with Android only",
          "es": "Empezar solo con Android"
        },
        "recommended": true,
        "why": {
          "pt-BR": "Google Play cobra uma taxa única; a revisão é mais rápida.",
          "en": "Google Play charges a one-time fee; review is faster.",
          "es": "Google Play cobra una tarifa única; la revisión es más rápida."
        }
      },
      {
        "name": {
          "pt-BR": "Android e iOS",
          "en": "Android and iOS",
          "es": "Android e iOS"
        },
        "why": {
          "pt-BR": "A App Store cobra anuidade e exige mais etapas de revisão.",
          "en": "The App Store charges a yearly fee and has more review steps.",
          "es": "La App Store cobra una cuota anual y exige más pasos de revisión."
        }
      }
    ],
    "error-tracking": [
      {
        "name": "Sentry",
        "recommended": true,
        "why": {
          "pt-BR": "Avisa quando um erro acontece em produção, com a linha do código (@sentry/react-native). Tem plano gratuito.",
          "en": "Alerts you when an error happens in production, with the line of code (@sentry/react-native). Has a free plan.",
          "es": "Avisa cuando ocurre un error en producción, con la línea de código (@sentry/react-native). Tiene plan gratuito."
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
      "jest"
    ],
    "ui": [
      "rn-ui",
      "expo-router"
    ],
    "app": [
      "backend"
    ],
    "data": [
      "local-storage"
    ],
    "env": [
      "env-example",
      "environments"
    ],
    "infra": [
      "eas",
      "stores"
    ],
    "security": [
      "secure-store",
      "https"
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
        "pt-BR": "Instalar o Expo Go no celular",
        "en": "Install Expo Go on your phone",
        "es": "Instalar Expo Go en el celular"
      },
      "command": "Google Play / App Store: Expo Go",
      "ok": {
        "pt-BR": "O app Expo Go abre no celular.",
        "en": "The Expo Go app opens on the phone.",
        "es": "La app Expo Go abre en el celular."
      }
    },
    {
      "title": {
        "pt-BR": "Criar o app",
        "en": "Create the app",
        "es": "Crear la app"
      },
      "command": "npx create-expo-app@latest meu-app",
      "ok": {
        "pt-BR": "A pasta meu-app tem src/app/ e app.json.",
        "en": "The meu-app folder has src/app/ and app.json.",
        "es": "La carpeta meu-app tiene src/app/ y app.json."
      },
      "docs": "https://docs.expo.dev/get-started/create-a-project/"
    },
    {
      "title": {
        "pt-BR": "Abrir no celular",
        "en": "Open on the phone",
        "es": "Abrir en el celular"
      },
      "command": "npx expo start",
      "ok": {
        "pt-BR": "Lendo o QR code com o Expo Go, o app aparece no celular.",
        "en": "Scanning the QR code with Expo Go shows the app on the phone.",
        "es": "Al leer el código QR con Expo Go, la app aparece en el celular."
      }
    }
  ],
  "folders": [
    {
      "path": "src/app/",
      "what": {
        "pt-BR": "Telas; cada arquivo vira uma rota (Expo Router).",
        "en": "Screens; each file becomes a route (Expo Router).",
        "es": "Pantallas; cada archivo se vuelve una ruta (Expo Router)."
      }
    },
    {
      "path": "src/components/",
      "what": {
        "pt-BR": "Peças de interface reutilizáveis.",
        "en": "Reusable interface pieces.",
        "es": "Piezas de interfaz reutilizables."
      }
    },
    {
      "path": "src/lib/",
      "what": {
        "pt-BR": "Acesso à API e ao armazenamento local.",
        "en": "API and local storage access.",
        "es": "Acceso a la API y al almacenamiento local."
      }
    },
    {
      "path": "assets/",
      "what": {
        "pt-BR": "Ícone, tela de abertura e imagens.",
        "en": "Icon, splash screen and images.",
        "es": "Ícono, pantalla de inicio e imágenes."
      }
    },
    {
      "path": "app.json",
      "what": {
        "pt-BR": "Nome, ícone e permissões do app.",
        "en": "App name, icon and permissions.",
        "es": "Nombre, ícono y permisos de la app."
      }
    }
  ],
  "prerequisites": [
    "Node.js",
    "Git",
    {
      "pt-BR": "Expo Go no celular",
      "en": "Expo Go on your phone",
      "es": "Expo Go en el celular"
    }
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
          "pt-BR": "Rode o app e leia o QR code com o Expo Go",
          "en": "Run the app and scan the QR code with Expo Go",
          "es": "Ejecuta la app y escanea el código QR con Expo Go"
        },
        "command": "npx expo start"
      }
    ]
  },
  "gitignore": [
    "node_modules/",
    ".expo/",
    "dist/",
    "web-build/",
    "/ios",
    "/android",
    "*.jks",
    "*.p8",
    "*.p12",
    "*.key",
    "*.mobileprovision",
    ".env",
    ".env*.local",
    "npm-debug.*",
    ".DS_Store"
  ],
  "envVars": [
    {
      "key": "EXPO_PUBLIC_API_URL",
      "secret": false,
      "example": "https://api.exemplo.com",
      "usedIn": [
        "app"
      ],
      "what": {
        "pt-BR": "Endereço da API. Vai dentro do app: qualquer pessoa pode ler.",
        "en": "API address. Ships inside the app: anyone can read it.",
        "es": "Dirección de la API. Va dentro de la app: cualquiera puede leerla."
      }
    },
    {
      "key": "EXPO_PUBLIC_SUPABASE_URL",
      "secret": false,
      "example": "https://xxxx.supabase.co",
      "usedIn": [
        "app"
      ],
      "what": {
        "pt-BR": "Endereço do projeto Supabase, se for o back-end escolhido.",
        "en": "Supabase project address, if it is the chosen back end.",
        "es": "Dirección del proyecto Supabase, si es el back-end elegido."
      }
    },
    {
      "key": "EXPO_PUBLIC_SUPABASE_ANON_KEY",
      "secret": false,
      "example": "(chave pública do painel)",
      "usedIn": [
        "app"
      ],
      "what": {
        "pt-BR": "Chave pública do Supabase; pode ir no app porque o acesso é controlado pelas regras do banco.",
        "en": "Supabase public key; can ship in the app because access is controlled by database rules.",
        "es": "Clave pública de Supabase; puede ir en la app porque el acceso se controla con las reglas de la base."
      }
    }
  ],
  "equivalences": {},
  "dependencyMap": {
    "expo": "expo-go",
    "react-native": "rn-ui",
    "expo-router": "expo-router",
    "expo-sqlite": "local-storage",
    "expo-secure-store": "secure-store",
    "@supabase/supabase-js": "backend",
    "@sentry/react-native": "error-tracking",
    "jest-expo": "jest"
  }
}
```
