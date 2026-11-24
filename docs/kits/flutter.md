# Kit — Flutter

Segue o formato do *Kit modelo — Laravel + React* (`docs/kits/laravel-react.md`). No repositório: `src/content/kits/flutter.json`.

- **Tipos de projeto:** mobile
- **Recomendado quando a pessoa domina:** —
- **Prefixo de variável pública:** nenhum (configuração entra no build)
- **Arquivos que a leitura do GitHub usa:** `pubspec.yaml`, `.env.example`
- **Itens:** 20 · pendentes no início: backend, stores, error-tracking
- **Trilha "Preparar o ambiente":** 5 passos
- **Equivalências:** não (kit sem par direto entre as stacks web)

Validado automaticamente: referências entre itens, uma opção recomendada por pendência, nenhum segredo com exemplo ou com prefixo público, textos em pt-BR, en e es. Os comandos e links precisam ser conferidos numa máquina limpa antes de cada release (lista de validação do kit modelo).

```json
{
  "id": "flutter",
  "version": "1.0.0",
  "name": {
    "pt-BR": "Flutter",
    "en": "Flutter",
    "es": "Flutter"
  },
  "summary": {
    "pt-BR": "App para Android e iOS em Dart, com a interface desenhada pelo próprio Flutter.",
    "en": "Android and iOS app in Dart, with the interface drawn by Flutter itself.",
    "es": "App para Android e iOS en Dart, con la interfaz dibujada por el propio Flutter."
  },
  "projectTypes": [
    "mobile"
  ],
  "knownStack": null,
  "publicEnvPrefix": null,
  "runsOn": ["backend", "stores"],
  "dependencyFiles": [
    "pubspec.yaml",
    ".env.example"
  ],
  "technologies": [
    {
      "id": "dart",
      "name": "Dart",
      "what": {
        "pt-BR": "A linguagem do Flutter, com tipos e null safety.",
        "en": "Flutter's language, typed and null-safe.",
        "es": "El lenguaje de Flutter, con tipos y null safety."
      },
      "docs": "https://dart.dev/guides"
    },
    {
      "id": "flutter",
      "name": "Flutter",
      "what": {
        "pt-BR": "Monta a interface com widgets e desenha tudo igual no Android e no iOS.",
        "en": "Builds the interface from widgets and draws it the same on Android and iOS.",
        "es": "Construye la interfaz con widgets y la dibuja igual en Android e iOS."
      },
      "docs": "https://docs.flutter.dev"
    },
    {
      "id": "riverpod",
      "name": "Riverpod",
      "what": {
        "pt-BR": "Gerencia o estado do app de forma previsível e testável.",
        "en": "Manages app state in a predictable, testable way.",
        "es": "Gestiona el estado de la app de forma predecible y testeable."
      },
      "docs": "https://riverpod.dev"
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
      "id": "pub",
      "zone": "tools",
      "name": "pub",
      "state": "decided",
      "when": "now",
      "tech": "dart",
      "why": {
        "pt-BR": "Instala os pacotes listados no pubspec.yaml.",
        "en": "Installs packages listed in pubspec.yaml.",
        "es": "Instala los paquetes listados en pubspec.yaml."
      },
      "docs": "https://dart.dev/tools/pub/cmd"
    },
    {
      "id": "android-studio",
      "zone": "tools",
      "name": "Android Studio",
      "state": "decided",
      "when": "now",
      "why": {
        "pt-BR": "Traz o emulador Android e o SDK que o Flutter precisa.",
        "en": "Provides the Android emulator and SDK Flutter needs.",
        "es": "Trae el emulador Android y el SDK que necesita Flutter."
      },
      "docs": "https://developer.android.com/studio"
    },
    {
      "id": "flutter-test",
      "zone": "tools",
      "name": "flutter test",
      "state": "decided",
      "when": "now",
      "tech": "flutter",
      "docs": "https://docs.flutter.dev/testing/overview"
    },
    {
      "id": "widgets",
      "zone": "ui",
      "name": "Widgets (Material Design)",
      "state": "decided",
      "when": "now",
      "tech": "flutter",
      "why": {
        "pt-BR": "A interface é uma árvore de widgets prontos e personalizáveis.",
        "en": "The interface is a tree of ready, customizable widgets.",
        "es": "La interfaz es un árbol de widgets listos y personalizables."
      },
      "docs": "https://docs.flutter.dev/ui"
    },
    {
      "id": "go-router",
      "zone": "ui",
      "name": "go_router",
      "state": "decided",
      "when": "now",
      "tech": "flutter",
      "why": {
        "pt-BR": "Navegação entre telas por rotas nomeadas.",
        "en": "Navigation between screens with named routes.",
        "es": "Navegación entre pantallas con rutas nombradas."
      },
      "docs": "https://pub.dev/packages/go_router"
    },
    {
      "id": "riverpod",
      "zone": "app",
      "name": "Riverpod",
      "state": "decided",
      "when": "now",
      "tech": "riverpod",
      "why": {
        "pt-BR": "Separa a lógica das telas e facilita testar.",
        "en": "Separates logic from screens and eases testing.",
        "es": "Separa la lógica de las pantallas y facilita las pruebas."
      }
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
      "name": "sqflite",
      "state": "decided",
      "when": "now",
      "tech": "flutter",
      "why": {
        "pt-BR": "Banco SQLite no próprio aparelho.",
        "en": "SQLite database on the device itself.",
        "es": "Base SQLite en el propio dispositivo."
      },
      "docs": "https://pub.dev/packages/sqflite"
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
      "id": "release",
      "zone": "infra",
      "name": {
        "pt-BR": "Build de release",
        "en": "Release build",
        "es": "Build de release"
      },
      "state": "decided",
      "when": "now",
      "tech": "flutter",
      "why": {
        "pt-BR": "flutter build gera o pacote para as lojas.",
        "en": "flutter build produces the store package.",
        "es": "flutter build genera el paquete para las tiendas."
      },
      "docs": "https://docs.flutter.dev/deployment/android"
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
      "id": "secure-storage",
      "zone": "security",
      "name": "flutter_secure_storage",
      "state": "decided",
      "when": "now",
      "tech": "flutter",
      "why": {
        "pt-BR": "Guarda tokens de login criptografados no aparelho.",
        "en": "Stores login tokens encrypted on the device.",
        "es": "Guarda tokens de inicio cifrados en el dispositivo."
      },
      "docs": "https://pub.dev/packages/flutter_secure_storage"
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
      "name": "Logs (logging)",
      "state": "decided",
      "when": "now",
      "tech": "dart"
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
      "from": "go-router",
      "to": "widgets",
      "type": "uses"
    },
    {
      "from": "widgets",
      "to": "riverpod",
      "type": "uses"
    },
    {
      "from": "riverpod",
      "to": "backend",
      "type": "calls"
    },
    {
      "from": "riverpod",
      "to": "local-storage",
      "type": "writes-to"
    },
    {
      "from": "secure-storage",
      "to": "backend",
      "type": "protects"
    },
    {
      "from": "release",
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
        "widgets",
        "riverpod",
        "local-storage"
      ]
    }
  ],
  "pendingOptions": {
    "backend": [
      {
        "name": "Firebase",
        "recommended": true,
        "why": {
          "pt-BR": "Banco, login e notificações com integração oficial no Flutter. Plano gratuito.",
          "en": "Database, auth and notifications with official Flutter integration. Free plan.",
          "es": "Base de datos, inicio de sesión y notificaciones con integración oficial en Flutter. Plan gratuito."
        }
      },
      {
        "name": "Supabase",
        "why": {
          "pt-BR": "PostgreSQL e login prontos, com SDK para Flutter. Plano gratuito.",
          "en": "PostgreSQL and auth ready, with a Flutter SDK. Free plan.",
          "es": "PostgreSQL e inicio de sesión listos, con SDK para Flutter. Plan gratuito."
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
          "pt-BR": "A App Store cobra anuidade e exige um Mac para gerar o app de iOS.",
          "en": "The App Store charges a yearly fee and requires a Mac to build the iOS app.",
          "es": "La App Store cobra una cuota anual y exige una Mac para generar la app de iOS."
        }
      }
    ],
    "error-tracking": [
      {
        "name": "Sentry",
        "recommended": true,
        "why": {
          "pt-BR": "Avisa quando um erro acontece em produção, com a linha do código (sentry_flutter). Tem plano gratuito.",
          "en": "Alerts you when an error happens in production, with the line of code (sentry_flutter). Has a free plan.",
          "es": "Avisa cuando ocurre un error en producción, con la línea de código (sentry_flutter). Tiene plan gratuito."
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
      "pub",
      "flutter-test"
    ],
    "ui": [
      "widgets",
      "go-router"
    ],
    "app": [
      "riverpod",
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
      "release",
      "stores",
      "github-actions"
    ],
    "security": [
      "secure-storage",
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
        "pt-BR": "Instalar o Flutter",
        "en": "Install Flutter",
        "es": "Instalar Flutter"
      },
      "command": "flutter --version",
      "ok": {
        "pt-BR": "O terminal mostra a versão do Flutter e do Dart.",
        "en": "The terminal shows the Flutter and Dart versions.",
        "es": "La terminal muestra las versiones de Flutter y Dart."
      },
      "docs": "https://docs.flutter.dev/get-started/install"
    },
    {
      "title": {
        "pt-BR": "Conferir o ambiente",
        "en": "Check the environment",
        "es": "Revisar el entorno"
      },
      "command": "flutter doctor",
      "ok": {
        "pt-BR": "Os itens de Flutter e Android aparecem com ✓.",
        "en": "The Flutter and Android items show ✓.",
        "es": "Los ítems de Flutter y Android aparecen con ✓."
      }
    },
    {
      "title": {
        "pt-BR": "Criar o app",
        "en": "Create the app",
        "es": "Crear la app"
      },
      "command": "flutter create meu_app",
      "ok": {
        "pt-BR": "A pasta meu_app tem lib/main.dart e pubspec.yaml.",
        "en": "The meu_app folder has lib/main.dart and pubspec.yaml.",
        "es": "La carpeta meu_app tiene lib/main.dart y pubspec.yaml."
      }
    },
    {
      "title": {
        "pt-BR": "Rodar no emulador ou no celular",
        "en": "Run on the emulator or phone",
        "es": "Ejecutar en el emulador o el celular"
      },
      "command": "flutter run",
      "ok": {
        "pt-BR": "O app contador aparece; salvar um arquivo atualiza na hora (hot reload).",
        "en": "The counter app appears; saving a file updates instantly (hot reload).",
        "es": "Aparece la app contador; guardar un archivo actualiza al instante (hot reload)."
      }
    },
    {
      "title": {
        "pt-BR": "Primeiro teste passando",
        "en": "First test passing",
        "es": "Primera prueba pasando"
      },
      "command": "flutter test",
      "ok": {
        "pt-BR": "O resumo mostra \"All tests passed!\".",
        "en": "The summary shows \"All tests passed!\".",
        "es": "El resumen muestra \"All tests passed!\"."
      }
    }
  ],
  "folders": [
    {
      "path": "lib/main.dart",
      "what": {
        "pt-BR": "Ponto de entrada do app.",
        "en": "App entry point.",
        "es": "Punto de entrada de la app."
      }
    },
    {
      "path": "lib/features/",
      "what": {
        "pt-BR": "Uma pasta por funcionalidade, com telas e lógica.",
        "en": "One folder per feature, with screens and logic.",
        "es": "Una carpeta por funcionalidad, con pantallas y lógica."
      }
    },
    {
      "path": "lib/data/",
      "what": {
        "pt-BR": "Acesso à API e ao banco local.",
        "en": "API and local database access.",
        "es": "Acceso a la API y a la base local."
      }
    },
    {
      "path": "test/",
      "what": {
        "pt-BR": "Testes.",
        "en": "Tests.",
        "es": "Pruebas."
      }
    },
    {
      "path": "pubspec.yaml",
      "what": {
        "pt-BR": "Dependências, ícones e fontes.",
        "en": "Dependencies, icons and fonts.",
        "es": "Dependencias, íconos y fuentes."
      }
    }
  ],
  "envVars": [
    {
      "key": "API_URL",
      "secret": false,
      "example": "https://api.exemplo.com",
      "usedIn": [
        "app"
      ],
      "what": {
        "pt-BR": "Endereço da API, passado com --dart-define. Vai dentro do app: qualquer pessoa pode ler.",
        "en": "API address, passed with --dart-define. Ships inside the app: anyone can read it.",
        "es": "Dirección de la API, pasada con --dart-define. Va dentro de la app: cualquiera puede leerla."
      }
    }
  ],
  "equivalences": {},
  "dependencyMap": {
    "flutter_riverpod": "riverpod",
    "go_router": "go-router",
    "sqflite": "local-storage",
    "flutter_secure_storage": "secure-storage",
    "firebase_core": "backend",
    "supabase_flutter": "backend",
    "sentry_flutter": "error-tracking"
  }
}
```
