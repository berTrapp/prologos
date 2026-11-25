# Prólogos — Regras de negócio

Como o produto se comporta. Complementa `docs/ux-ui.md` (como ele se parece). Decisões confirmadas em 23/11/2026.

**Problema que o Prólogos resolve:** a dificuldade de começar um projeto por falta de organização — inclusive numa linguagem que a pessoa ainda não conhece. Promessa: do "tenho uma ideia" ao primeiro commit, com tudo decidido.

**Público-alvo.** Principal: dev em início de carreira ou estudante, trabalhando sozinho, que trava no começo de projetos pessoais e de portfólio e muitas vezes quer usar uma stack que ainda não domina. Secundário: dev experiente solo ou freelancer que quer padronizar o planejamento e apresentá-lo a clientes. Fora do público: equipes grandes, gerentes de projeto e gestão de tarefas. O Prólogos ajuda a **começar bem**; não acompanha a execução do projeto.

## 1. Estrutura do mapa

- **Hierarquia:** projeto → zona → subzona → item. No máximo dois níveis (zona e subzona).
- **Item em uma zona só.** Para aparecer em outra, cria-se uma conexão.
- **Zonas:** todo projeto começa com as 9 zonas padrão (ids `method`, `tools`, `ui`, `app`, `data`, `env`, `infra`, `security`, `observability`). A pessoa pode adicionar zonas, excluir qualquer zona (inclusive as padrão) e criar subzonas livremente. Uma zona nova usa uma das 9 cores de zona; a cor nunca é um valor solto.
- **Excluir zona ou subzona:** os itens dentro vão juntos para a lixeira, com as subzonas e as conexões que tocam neles, e voltam com Desfazer.
- **Conexões:** direção obrigatória; tipo opcional (usa, depende de, envia para).
- **Layout automático:** zonas em grade, com o tamanho dado pelo conteúdo, e itens em fileiras dentro da zona, na ordem guardada. Arrastar um item muda a ordem ou a zona dele; não há posição livre nem redimensionamento à mão.
- **Zona recolhida:** vira um card com o nome e a contagem de itens; as conexões que entram ou saem dela passam a apontar para o card, agrupadas por destino com a contagem.
- **Filtro por zona ("Tags"):** destaca as zonas escolhidas e apaga as demais; não esconde nem altera nada.
- **Fluxos:** sequência ordenada de conexões existentes. Podem passar por itens futuros; na visão Hoje esse trecho aparece tracejado. Cada passo é só a conexão: o player mostra "origem → destino · tipo", sem texto próprio por passo.
- **Fluxo com item excluído:** o fluxo continua; o trecho cuja conexão foi para a lixeira aparece como lacuna. Restaurar o item (e suas conexões) reconstrói o fluxo.

## 2. Hoje / Completo

- Cada item é **atual** ou **futuro**. Não existe "descartado": descartar é excluir, e o histórico guarda.
- Na visão Hoje, itens futuros e as conexões que tocam neles ficam escondidos.
- Checklist e custos seguem a visão ativa.

## 3. Variáveis de ambiente

- **O Prólogos não guarda valores secretos.** Guarda chave, descrição, ambiente, onde é usada e a marca "segredo". Valores não secretos (ex.: `APP_ENV=production`) são opcionais.
- Ao importar um `.env`, os valores são lidos só para classificar e avisar, e depois descartados.
- **Ambientes:** desenvolvimento, homologação e produção fixos; a pessoa pode adicionar outros.
- **Validação:** chave em `MAIÚSCULAS_COM_UNDERSCORE`; não repete no mesmo ambiente; variáveis expostas ao cliente usam o prefixo público da stack (`VITE_` no Vite, `EXPO_PUBLIC_` no Expo…), definido pelo kit; aviso quando um segredo está numa variável pública.

## 4. Status do projeto

Planejando · Em desenvolvimento · Pausado · Concluído · Arquivado. Arquivar tira o projeto da lista principal sem apagar. No Início, o filtro mostra Todos, Planejando, Em desenvolvimento e Pausados; os concluídos aparecem em Todos e os arquivados num link "Ver arquivados" abaixo da lista.

**Sem conta no MVP:** o Início cumprimenta só pela hora ("Boa tarde"), sem nome nem avatar, até existir login (regra 12).

## 5. Checklist de cobertura ("O que falta decidir")

- Cada zona tem itens esperados (ex.: Segurança espera autenticação, HTTPS e backup), vindos do starter kit ou de um padrão.
- Os itens pendentes aparecem em ordem, com o **próximo passo** sempre visível no topo do mapa.
- Qualquer item esperado pode ser marcado **Não se aplica**, com motivo curto; conta como coberto.
- A porcentagem segue a visão ativa (Hoje ou Completo).
- **Conta na porcentagem:** cada item esperado (decidido ou "Não se aplica" conta como resolvido) e cada passo de "Preparar o ambiente" quando a seção existe. 100% só com tudo resolvido.
- **Na visão Hoje,** itens futuros não aparecem nem contam; no Completo, aparecem com "Futuro" e contam pela situação.
- **Pendentes fora do kit** (criados pela pessoa ou de projeto sem kit) também aparecem, na zona deles; nada a decidir fica escondido.
- **Item esperado que saiu do mapa** aparece como "Falta no mapa", com "Adicionar ao mapa", que traz o item do kit de volta.
- **Ordem:** "Preparar o ambiente" primeiro; depois as zonas com pendência, na ordem do próximo passo (banco, hospedagem) e então na ordem das zonas; por fim as zonas resolvidas. Dentro da zona, pendentes antes dos resolvidos.
- **Marcar no checklist reflete no mapa:** o círculo da linha alterna Decidido e A decidir; "Não se aplica" aparece no item do mapa, apagado, e o tira do próximo passo. O painel do mapa mostra o motivo e "Voltar a considerar".
- **Passos de "Preparar o ambiente"** ficam marcados no projeto; com todos feitos, a seção sai do próximo passo.

## 6. Custos

- Cada custo é registrado na moeda original e no período original (mensal ou anual).
- O total é mostrado na moeda do idioma escolhido (reais em pt-BR) por mês, com cotação informada pela pessoa ou atualizada uma vez por dia.
- Plano gratuito: o limite fica guardado como texto, para referência; o uso real não é monitorado.
- Total atual (Hoje) e projetado (Completo).

## 7. GitHub e divergências

- **A fonte da verdade é o mapa.** O repositório só gera avisos; nunca altera o mapa sozinho.
- **Arquivos lidos (lista fechada):** `package.json`, `composer.json`, `pom.xml`, `build.gradle`, `*.csproj`, `requirements.txt`, `pyproject.toml`, `pubspec.yaml`, `app.json`, `.env.example`, `docker-compose.yml`, `Dockerfile`, workflows do GitHub Actions e arquivos de configuração conhecidos. Código-fonte não é lido. O `.env` nunca é lido do repositório.
- **Dependência → item:** por uma tabela de correspondência mantida pelo Prólogos (ex.: `laravel/framework` → Laravel). Cada projeto pode marcar "ignorar esta dependência".
- **Frequência:** sob demanda, e automática ao abrir o projeto quando a última leitura tem mais de 24 h.
- **Permissão:** só leitura. Abrir PR na exportação pede permissão de escrita, só naquele momento.
- Se um `.env` real estiver commitado no repositório, o Prólogos avisa.

## 8. Histórico

- Versão automática ao fim de cada sessão de edição (30 min sem mexer) e manual com nome quando a pessoa quiser.
- Retenção: versões com nome para sempre; automáticas por 90 dias.
- Aplicar um rascunho quando o mapa principal mudou: mostra a comparação e a pessoa escolhe item por item, como nas divergências.

## 9. Notas e riscos

- Risco tem severidade (alta, média, baixa) e pode ser marcado como resolvido.
- Risco resolvido sai do mapa e continua no histórico.

## 10. Exportar

- Nunca exporta valores secretos (pela regra 3, eles nem existem no Prólogos).
- Formatos: `.env.example`, `docker-compose.yml`, README com Mermaid, `mapa.mmd`, PNG/SVG, **`mapa.html`** (regra 19) e `prologos.json` (backup que pode ser importado de volta).
- Arquivos gerados saem no idioma escolhido.

## 11. Lixeira

- Itens, zonas e projetos excluídos ficam 30 dias na lixeira e podem ser restaurados.
- Esvaziar a lixeira é a única exclusão que pede confirmação.

## 12. Conta e compartilhamento (com backend)

- Login com GitHub (OAuth).
- Convites somente leitura, por link ou e-mail, até 5 pessoas por projeto, com expiração.
- Link público somente leitura por projeto, para portfólio, desligado por padrão.
- Alvo de desempenho: mapas com até 300 itens.
- LGPD: exportar todos os dados e excluir a conta.
- Sincronização entre aparelhos: vence a última alteração por item, com aviso.

## 13. Início guiado (MVP)

- Todo projeto novo começa por 5 passos: **ideia** (nome, objetivo em uma frase, tipo), **stack** (kit), **experiência**, **onde roda** (banco e hospedagem) e **resumo**. Todos podem ser pulados e respondidos depois no mapa.
- **Tipos:** app web completo, só API, **app mobile**, site, ainda não sei.
- **"Ainda não sei"** é sempre uma resposta válida: vira item pendente (tracejado em amarelo) e entra no checklist "O que falta decidir".
- **Stack "Ainda não sei" (ou passo pulado):** o projeto nasce com as 9 zonas e três itens pendentes — Stack (Aplicação), Banco de dados (Dados) e Hospedagem (Infraestrutura). Pular todos os passos cria um projeto assim, com o nome "Projeto sem nome" se faltar nome.
- **Onde roda:** o passo pergunta os itens pendentes que o kit lista em `runsOn` (banco e hospedagem nos kits web; back-end e lojas nos mobile; hospedagem e domínio no site), com as opções do kit e a recomendada marcada. "Ainda não sei" mantém o item pendente.
- **Recomendação de kit:** site → site estático; app mobile → React Native se a pessoa domina Laravel ou Node (já conhece React), senão Flutter; demais tipos (inclusive "Ainda não sei") → o kit da stack que a pessoa já domina; sem stack dominada, nenhum kit vem recomendado e todos aparecem. A pessoa pode escolher outro para aprender. Sem IA no MVP, o tipo "Ainda não sei" não lê o objetivo: a decisão fica para depois, no mapa.
- O resultado é um mapa já montado com itens **decididos** e **pendentes**, e o **primeiro passo** em destaque, nesta ordem de prioridade: escolher a stack (se não há kit) → preparar o ambiente (se há tecnologia nova) → escolher o banco → escolher a hospedagem → desenhar o primeiro fluxo.

## 14. Starter kits e conteúdo curado

- **Sem IA no MVP (opção A).** Todo conteúdo é curado e versionado no repositório (arquivos de dados), aberto a contribuições.
- **Kits iniciais (8), com as stacks mais usadas no Brasil:** Laravel + React · Node + React · Java + Spring Boot (+ React) · C# + .NET (+ React) · Python + Django · React Native (Expo) · Flutter · Site estático (Astro). O conteúdo de cada um está em `docs/kits/`.
- Cada kit traz: zonas e itens padrão, itens esperados do checklist, estrutura de pastas explicada, tecnologias com uma frase "o que é", links da documentação oficial, prefixo de variável pública, arquivos de dependência que o GitHub lê e a trilha "Preparar o ambiente".
- **Kits não fixam versão:** nomes sem número ("Laravel", não "Laravel 11"); a trilha manda instalar a versão estável atual, LTS quando houver. Comandos e links são conferidos numa máquina limpa a cada release.
- Todo texto de kit existe em todos os idiomas suportados (regra 17); um kit só entra quando está completo em pt-BR e en.
- O assistente de IA continua como ideia futura, para cobrir stacks fora da curadoria usando os kits como referência.

## 15. Aprender uma stack nova

- No passo "Experiência", cada tecnologia do kit é marcada como **Conheço**, **Usei pouco** ou **Nunca usei**. O padrão vem da stack que a pessoa diz dominar.
- Itens de tecnologias "Nunca usei" ganham o selo **Novo para você** no mapa (ponto violeta) e, no painel do item, a explicação, por que está ali e o link da documentação.
- Havendo tecnologia nova, o checklist ganha a seção **Preparar o ambiente**: instalar, criar o projeto, rodar o servidor, primeiro teste — cada passo com o comando e como saber que deu certo. Não é um módulo de tarefas.
- **Equivalências:** a pessoa informa a stack que domina (Laravel/PHP, Node/JavaScript, Spring/Java, .NET/C#, Django/Python ou nenhuma) e os conceitos do kit escolhido aparecem traduzidos a partir dela (ORM, migrations, rotas, gerenciador de pacotes, servidor de desenvolvimento, configuração). Kits mobile e o site estático não têm tabela de equivalências no MVP.
- Em escolhas com várias opções, uma vem marcada como **recomendada para começar**, com o que cada uma implica em linguagem simples.
- **Equivalente no painel do item:** itens de kit com o campo `concept` (orm, migrate, routes, packages, devServer, config, templates, auth, tests) mostram o equivalente na stack que a pessoa domina ("No Laravel, o equivalente é Eloquent").

## 16. Pronto para codar

- Quando as decisões essenciais estão fechadas, o projeto atinge o marco **Pronto para codar** e oferece o kit de início do repositório: README com "Como rodar localmente" (pré-requisitos, variáveis explicadas e onde conseguir cada valor, comandos em ordem), `.env.example`, `docker-compose.yml` (quando o kit usa), `.gitignore` e estrutura de pastas.

## 17. Idioma

- Idiomas: **Português (Brasil)** (padrão e referência), **English** e **Español**.
- Primeiro acesso segue o idioma do navegador; se não for suportado, pt-BR. A escolha fica em Configurações e é lembrada.
- Traduz tudo: interface, mensagens, toasts, conteúdo dos kits, equivalências e arquivos gerados no export. Termos técnicos (ORM, migrations, `.env`) não são traduzidos.
- Datas, números e moedas formatados pelo idioma (Intl).
- Nenhum texto fixo no código: tudo passa pelos arquivos de tradução; uma chave faltando em en ou es cai para pt-BR e é apontada no teste.
- Dados do projeto (nomes, notas) ficam como a pessoa escreveu; trocar o idioma não os altera.
- Itens e zonas que vieram de um kit mostram o nome do kit no idioma atual enquanto a pessoa não os renomeia; depois de renomeados, ficam como ela escreveu.

## 18. Dados locais e backup (MVP)

- No MVP os projetos ficam **só neste navegador** (IndexedDB). Isso é dito com clareza: aviso fixo em Configurações e na primeira vez que a pessoa cria um projeto.
- **Backup:** "Exportar tudo" gera um `.json` com todos os projetos; "Importar" restaura um projeto ou todos, sem apagar o que já existe (projeto com mesmo id pergunta se substitui ou cria cópia).
- **Lembrete:** ligado por padrão; quando o último backup tem mais de 7 dias (ou nunca houve backup e existe pelo menos um projeto), o Início mostra um alerta em linha com "Exportar agora" e "Lembrar depois", que esconde o alerta por 1 dia. Pode ser desligado.
- O app pede armazenamento persistente ao navegador (`navigator.storage.persist`) para reduzir o risco de limpeza automática.
- O backup segue a regra 3: nenhum valor secreto.

## 19. Compartilhar sem servidor (MVP)

- Exportar `mapa.html`: **um arquivo só**, somente leitura, com o mapa interativo (arrastar, zoom, zonas, fluxos, Hoje/Completo) e sem nenhuma capacidade de edição.
- Feito para publicar no portfólio (GitHub Pages, Netlify) ou mandar para alguém abrir no navegador.
- Sem valores de variáveis, sem notas marcadas como privadas e sem dados de outros projetos.
- Substituído pelo link público (regra 12) quando houver backend; os dois podem coexistir.

## 20. Salvar como kit (logo após o MVP)

- Qualquer projeto pode virar um **kit pessoal**: a pessoa escolhe nome, descrição e quais zonas e itens entram; notas, riscos, custos e variáveis com valor nunca entram.
- Kits pessoais aparecem no passo "Stack" do início guiado, separados dos kits curados.
- Podem ser exportados e importados em `.json` para usar em outro navegador ou compartilhar.
- Um kit pessoal pode ser proposto como kit curado por PR no repositório.

## 21. Validação do produto

- Antes de seguir para depois do MVP, pelo menos 5 pessoas do público principal criam um projeto do zero sem ajuda.
- Métricas: tempo até o primeiro mapa (meta: menos de 10 min) e quantas chegam ao "Pronto para codar".
- O que travar vira ajuste nos kits, no início guiado ou nestes docs.
