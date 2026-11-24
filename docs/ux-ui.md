# Prólogos — Regras de UX/UI

Regras que toda tela do Prólogos segue. Valem para quem desenha, quem programa e para o Claude. Uma tela só está pronta quando passa no checklist do fim deste documento.

## 1. Posição: o controle fica junto do que ele controla

- O botão que recolhe um painel fica **no topo desse painel**, na borda mais próxima de onde ele recolhe. Nunca no rodapé.
- Barra lateral: botão de recolher no topo, ao lado do logo. Painel de detalhes: botão no cabeçalho do painel. Zona do mapa: botão no cabeçalho da zona.
- Quando um painel está recolhido, sempre fica um "puxador" visível no mesmo lugar para reabrir.
- Ação principal da tela: canto superior direito do conteúdo, no máximo **uma** por tela no estilo primário.
- Ações destrutivas (excluir, remover) ficam separadas das outras e nunca com o estilo primário.

## 2. Consistência

- O mesmo componente tem sempre a mesma aparência, o mesmo ícone e a mesma posição em todas as telas. Nenhuma tela desenha o seu próprio badge, botão ou card: usa os componentes da seção 13.
- Ícone de recolher/expandir é o mesmo em todo lugar (painel com seta).
- Termos fixos: "Recolher / Expandir", "Hoje / Completo", "Zona", "Item", "Fluxo", "Nota", "Risco", "Divergência", "Próximo passo", "O que falta decidir", "Novo para você", "Pronto para codar". Não usar sinônimos.
- Cores de tag têm significado fixo: Metodologia rosa, Ferramentas amarelo, Interface violeta, Aplicação azul, Dados verde, Infraestrutura ciano, Ambiente laranja, Segurança vermelho, Observabilidade lima.

| Zona | Escuro | Claro |
|---|---|---|
| Metodologia | #F472B6 | #DB2777 |
| Ferramentas | #FACC15 | #CA8A04 |
| Interface | #7C5CFF | #7C5CFF |
| Aplicação | #60A5FA | #2563EB |
| Dados | #34D399 | #059669 |
| Ambiente | #FB923C | #EA580C |
| Infraestrutura | #22D3EE | #0891B2 |
| Segurança | #F87171 | #DC2626 |
| Observabilidade | #A3E635 | #65A30D |

No tema claro as cores de zona ficam um tom mais escuras para o texto e o traço manterem contraste AA. O gradiente da marca (#7C5CFF → #22D3EE) não muda entre os temas.

## 3. Hierarquia e leitura

- Cada tela responde a uma pergunta só; o título diz qual.
- No máximo três níveis de texto por bloco: título, texto, detalhe (mono, caixa alta, cor apagada).
- Divulgação progressiva: o essencial aparece; o detalhe vai para o painel lateral, um card expandido ou uma zona aberta.
- Números importantes em tamanho grande e com rótulo curto embaixo.
- O **próximo passo** fica sempre visível no topo do mapa e do checklist.

## 4. Espaço e tamanho

- Espaçamentos em múltiplos de 4 px (4, 8, 12, 16, 24, 32, 48).
- Alvo clicável mínimo: 32 px no desktop, 44 px em telas de toque.
- Bordas de 1 px quase transparentes.
- **Raios permitidos (só estes):** 2 px (quadradinho de tag) · 6 px (badge, chip, skeleton) · 8 px (botões e campos no desktop) · 10 px (trilho do controle segmentado, linhas de lista) · 12 px (controles de toque, cards internos, toast) · 16 px (cards e painéis) · 20 px (folhas do celular, diálogos grandes) · 999 px (pílulas, interruptor, contador).
- Texto de interface entre 12 e 15 px no desktop; nada abaixo de 10,5 px.

## 5. Cor e contraste

- Contraste mínimo AA: 4,5:1 para texto, 3:1 para ícones e bordas que transmitem informação.
- Nunca depender só da cor: status sempre com ícone ou texto junto (ponto + "Planejando", "≠" + "divergência", tracejado + "A decidir").
- Gradiente só no logo e em destaques pontuais (fluxo ativo, anel de cobertura). Fundos e textos ficam sólidos.
- Tema claro e escuro desde o início; o padrão segue o sistema.

## 6. Movimento

- **Sem animação de entrada.** A página abre pronta: nada sobe, aparece em fade ou entra em cascata ao carregar. Barras de progresso já abrem no valor final.
- Movimento só responde a uma ação da pessoa (abrir painel, recolher zona, trocar de vista, mover a câmera, um toast que chega).
- Durações entre 150 e 300 ms para interações; até 800 ms para mudanças de câmera no mapa.
- Animar só `transform` e `opacity` (e largura de painéis quando necessário).
- O movimento explica a mudança: o card sai de onde estava e entra onde vai ficar.
- Respeitar `prefers-reduced-motion`: sem deslocamento, no máximo troca instantânea.
- Animações contínuas só para fluxos ativos no mapa, carregamento (spinner e o mini-mapa da seção 15) e o modo Apresentação. Fundo decorativo não se mexe.
- Quando o conteúdo carregado chega, ele substitui o skeleton ou o carregamento direto, sem fade.

## 7. Feedback e estados

- Toda ação responde em menos de 100 ms (hover, pressionado, troca de estado).
- O resultado de uma ação é comunicado pela regra da seção 14 (toast) e a espera pela seção 15 (carregamento).
- Todo elemento interativo tem os estados: normal, hover, foco, pressionado, desativado e carregando.
- Erros de formulário aparecem embaixo do próprio campo, nunca em toast.
- Estados vazios são convites: ícone em quadro de 44 px, título, uma frase e uma ação ("Comece o primeiro projeto").
- Erros de tela inteira dizem o que aconteceu, o que **não** foi afetado e o que fazer, com até duas ações ("Importar backup", "Tentar de novo").
- **Opções com consequências:** quando a pessoa precisa escolher (banco, hospedagem), cada opção mostra o que implica em uma frase, e uma vem marcada "Recomendado para começar".
- **Interface otimista:** mudanças simples (status, renomear, mover) aparecem na hora. Se o salvamento falhar, o valor volta ao anterior e aparece um toast de erro.
- **Salvamento automático:** não gera toast. Um indicador discreto na barra lateral mostra "Salvo", "Salvando…" ou "Salvo neste navegador".
- **Dados locais:** o aviso de que os projetos ficam só neste navegador aparece uma vez ao criar o primeiro projeto e fica fixo em Configurações; o lembrete de backup aparece no Início como alerta em linha (regras de negócio, seção 18).

## 8. Reversibilidade

- Preferir **desfazer** a confirmar. Confirmação só para o que não tem volta (desconectar o GitHub, esvaziar a lixeira).
- Excluir projeto, zona ou item manda para a **lixeira por 30 dias**, com Desfazer no toast.
- Toda resolução de divergência, toda importação e toda escolha de opção podem ser desfeitas.

## 9. Teclado e acessibilidade

- Tudo funciona pelo teclado; foco sempre visível.
- `Ctrl K` abre a paleta de comandos em qualquer tela. No mapa: `V` selecionar, `N` novo item, `Z` nova zona, `C` conectar.
- Atalhos aparecem nas dicas dos botões.
- Elementos reais: `button` para ações, `a` para navegação, `label` em todo campo.
- Botões só com ícone têm `aria-label` e dica (tooltip).
- Toasts ficam numa região `aria-live="polite"`; erros usam `role="alert"`.

## 10. Memória da interface

- O app lembra as escolhas da pessoa: barra lateral recolhida, painel de detalhes, zonas recolhidas, tema, idioma, último projeto aberto, zoom do mapa.
- Voltar a uma tela devolve a pessoa ao mesmo ponto.

## 11. Textos e idiomas

- Idiomas: Português (Brasil) é o padrão e a referência; English e Español seguem o mesmo tom (regras de negócio, seção 17).
- **Nenhum texto fixo no componente:** todo texto passa pelos arquivos de tradução, inclusive `aria-label`, dicas, toasts e textos gerados no export.
- Sentence case, verbo no início ("Importar arquivos", "Adicionar variável" / "Import files", "Add variable").
- Sem "por favor", sem "com sucesso", sem exclamação (o mesmo vale para "please" e "successfully" em inglês).
- Mensagens curtas; quando precisar explicar, uma frase de contexto e uma de ação.
- Carregando: gerúndio com reticências ("Exportando…", "Exporting…").
- **Espaço para tradução:** botões e rótulos aguentam textos até 30% maiores sem quebrar o layout; nada de largura fixa para texto.
- Termos técnicos não se traduzem (ORM, migrations, `.env`, deploy).
- Datas, números e moeda formatados pelo idioma (`Intl`); nunca montar data ou número na mão.

## 12. Celular e telas pequenas

O Prólogos é desenhado para três larguras: celular (até 759 px), tablet (760 a 1023 px) e desktop (1024 px ou mais). Toda tela nasce pensando no celular também; nenhuma informação some, só muda de lugar.

**Navegação**
- Celular: barra de abas embaixo (Mapa, Checklist, Custos, GitHub, Mais), ao alcance do polegar. Variáveis, Histórico, Exportar, Lixeira e Configurações ficam em "Mais". A barra lateral não aparece.
- Tablet: a barra lateral começa recolhida (só ícones).
- A aba ativa tem ícone mais forte e texto em negrito, não só cor.
- Voltar fica sempre no canto superior esquerdo.

**Mapa no celular**
- Duas visões: **Zonas** (padrão) mostra as zonas em lista sanfonada, com subzonas aninhadas; **Mapa** mostra o canvas com arrastar e zoom.
- Tocar num item abre o painel de detalhes, que sobe de baixo (folha); fecha tocando fora ou na alça.
- No celular o mapa é para consultar e decidir: dá para escolher a opção de um item pendente, mudar Atual/Futuro e marcar "Não se aplica". Edição completa (criar zonas, conectar itens) fica no desktop.
- Zoom com botões de +, − e "ver tudo" sempre visíveis, além do gesto.

**Toque**
- Alvo mínimo de 44 × 44 px, com pelo menos 8 px entre alvos.
- Ações principais na metade de baixo da tela; a ação de criar vira botão flutuante no canto inferior direito.
- Nada depende de hover: dica, menu e detalhe também abrem com toque.
- Respeitar a área segura do sistema (barra de gestos e entalhe).
- Toasts aparecem no topo, longe da barra de abas.

**Conteúdo**
- Texto de corpo com 15 a 16 px; nada abaixo de 11 px.
- Tabelas viram listas de cards; comparações "mapa × repositório" ficam empilhadas.
- Painéis laterais do desktop viram folhas de baixo; diálogos grandes viram telas inteiras.
- Campos de texto com 16 px, para o navegador não dar zoom ao focar.

## 13. Componentes

Toda tela é montada com estes componentes. Se algo novo não cabe em nenhum deles, primeiro cria-se o componente aqui (nome, anatomia, variantes, estados) e só depois ele entra numa tela. Estilo solto (`style` inline com cor, raio ou fonte próprios) não passa em revisão.

Base no código: `src/components/ui/` (shadcn/ui + Tailwind). Cada componente tem um arquivo, variantes por `cva`, e tokens vindos do tema — nunca hex direto no componente. Toasts com **Sonner** (o toast do shadcn/ui), estilizado com os tokens abaixo.

### 13.1 Tokens que os componentes usam

| Token | Escuro | Claro | Uso |
|---|---|---|---|
| `bg` | #0B0D12 | #F6F7F9 | fundo da página |
| `surface` | gradiente #14171E → #101217 | #FFFFFF | cards e painéis |
| `surface-raised` | gradiente #191C24 → #14161D | #FFFFFF + sombra | toast, menus, popovers |
| `border` | branco 7,5% | preto 8% | bordas de 1 px |
| `text` | #E6E8EE | #12141A | texto principal |
| `muted` | #8F95A8 | #5B6070 | texto secundário |
| `faint` | #7A8096 | #6B7080 | rótulos mono |
| `success` | #6EE7B7 | #047857 | concluído, novo, em dia |
| `warning` | #FCD34D | #92400E | atenção, divergência, média, a decidir |
| `danger` | #FCA5A5 | #B42318 | risco, erro, alta, inválido, segredo |
| `info` | #93C5FD | #1D4ED8 | atualização, nota, pública |
| `accent` | #C4B5FD | #6D28D9 | IA, ideia futura, novo para você, próximo passo |
| `neutral` | #B4BAC8 | #4B5160 | igual, baixa, sem status |

Fontes: Geist (interface) e Geist Mono (código, chaves, valores, rótulos técnicos).

### 13.2 Badge

Rótulo curto de estado ou categoria. Não é clicável.

- **Anatomia:** altura 22 px · padding 0 8 px · raio 6 px · Geist 12 px peso 500 · sentence case (primeira letra maiúscula, nunca caixa alta) · ponto opcional de 6 px à esquerda.
- **Cor:** uma só cor por badge (o token da variante). O fundo é essa cor a 12% e o contorno interno a 24% — nunca fundo sólido, nunca texto escuro sobre cor.
- **Variantes:** `neutral`, `success`, `warning`, `danger`, `info`, `accent`, e `planned` (sem fundo, contorno tracejado, cor `muted`) para "Futuro", "Rascunho", "Ideia futura".
- **Mapeamento fixo de estados:**
  - Divergência: diferente → warning · só no repositório → success · só no mapa → danger · novo no repositório → info
  - Importação (.env e arquivos): nova → success · atualiza → info · igual / repetida → neutral · inválida → danger · conflito → warning
  - Severidade (checklist, riscos): alta → danger · média → warning · baixa → neutral
  - Tarefa em andamento: importando → info · concluído → success · cancelado → neutral
  - Checklist: decidido → success · a decidir → warning · futuro → info · não se aplica → neutral
  - Variáveis: segredo → danger · pública → info · configuração → neutral
  - Novo para você → accent (com ponto) · Recomendado (para começar) → accent
  - Nota → info · Risco → danger · Futuro → planned · tipo do item na lixeira → neutral
- **Regras:** texto de 1 a 3 palavras; largura pelo conteúdo (sem largura fixa); no máximo dois badges lado a lado; não usar badge para o que é ação (isso é botão) nem para tecnologia (isso é chip).

### 13.3 Contador

Número de pendências num item de navegação ou aba.

- Pílula de 18 px (16 px no celular, sobre o ícone da aba) · padding 0 5 px · fundo `#FBBF24` sólido, texto `#1A1305` · Geist 11 px peso 700.
- Só aparece com valor maior que zero; acima de 99 mostra "99+".
- É o único elemento com fundo sólido amarelo no app.

### 13.4 Status com ponto

Status de projeto ("Em desenvolvimento", "Planejando", "Pausado") e de conexão.

- Ponto de 6 px na cor do status + texto 12 px em `muted`. Sem fundo, sem contorno.
- Usado nas listas de projetos (desktop e celular) e no rodapé de cards.

### 13.5 Chip

Nome de tecnologia, chave, comando ou valor técnico (React, `DATABASE_URL`, `php artisan migrate`).

- Altura 24 px · padding 0 8 px · raio 6 px · Geist Mono 11,5 px · fundo branco 4% + contorno interno 8% · texto #C3C8D6.
- Com ação (remover, filtrar, sugestão clicável) ganha o estado hover e, para remover, um × de 12 px; sem ação, é estático.

### 13.6 Tag de zona

Identifica a zona do mapa (Metodologia, Infraestrutura…).

- Quadrado de 6 px com raio 2 px na cor da zona + nome em 12 px. Sem fundo.
- É o único lugar onde as cores de zona aparecem fora do mapa.

### 13.7 Botão

- **Primário:** fundo sólido `#EDEEF2`, texto `#0B0D12` (invertido no claro). Um por tela.
- **Secundário (ghost):** fundo transparente com contorno interno branco 10%, texto `text`; hover ganha fundo branco 4%.
- **Só ícone:** 32 × 32 px (44 no toque), com `aria-label` e dica.
- **Destrutivo:** texto `danger` sobre ghost; nunca primário.
- **Tamanhos:** padrão 36 px · compacto 32 px (barras de ferramentas, dentro de toast) · toque 44–48 px. Raio 8 px no desktop, 12 px no toque. Geist 13 px peso 500–600 · ícone 16 px a 8 px do texto.
- **Carregando:** o ícone vira spinner, o texto vira gerúndio ("Exportando…") e a largura não muda (`min-width` fixada no início); `aria-busy="true"`; clique repetido é ignorado.

### 13.8 Controle segmentado

Trocas de vista com 2 a 4 opções (Hoje / Completo, Zonas / Mapa, Atual / Futuro, Decidido / Pendente, ambientes).

- Trilho com fundo branco 3% e contorno 7,5%, padding 3 px, raio 10 px; opção ativa com fundo branco 9% e sombra leve, texto `text`; inativas em `muted`.
- Altura da opção 32 px (38–44 no toque), raio 8 px.

### 13.9 Card

- Fundo `surface`, borda interna de 1 px `border`, raio 16 px, padding 16–24 px. Cards dentro de cards: raio 12 px, sem sombra.
- Cabeçalho: título 14–15 px peso 600 + rótulo mono opcional à direita.
- Card clicável inteiro tem hover (borda um pouco mais forte) e foco visível; nunca botão dentro de card clicável.
- **Card de destaque** (próximo passo, novo para você): contorno interno na cor `accent` a 30% e fundo `accent` a 7%.

### 13.10 Painel e folha

- **Painel lateral** (barra lateral, inspetor): largura fixa, borda de 1 px no lado que encosta no conteúdo, botão de recolher no cabeçalho.
- **Folha** (celular): sobe de baixo com alça de 36 × 4 px, raio 20 px no topo, fundo `surface` com leve desfoque; fecha tocando fora, na alça ou arrastando.
- **Diálogo / paleta:** centralizado, raio 16–20 px, fundo escurecido atrás a 60%; `Esc` fecha.
- **Popover** (novo item no mapa): ancorado no ponto de origem, raio 12 px, fundo `surface-raised`; `Esc` fecha.

### 13.11 Campos e seleção

- **Campo de texto:** altura 36 px (44 no toque, com texto de 16 px), raio 8 px, fundo branco 3%, contorno 8%; foco com anel violeta de 2 px. Rótulo sempre visível acima, nunca só placeholder. Área de texto: raio 12 px, fundo #0A0C10.
- **Interruptor:** trilho 34 × 20 px (raio 999), bolinha branca de 16 px a 2 px da borda; desligado em branco 15%, **ligado em verde #34D399**. O texto do rótulo fica à esquerda e todo o conjunto é clicável (`role="switch"`).
- **Caixa de seleção:** 18 px, raio 6 px, marcada em verde `success` com check escuro; alvo clicável de 32 px em volta.

### 13.12 Toast

Regra de quando usar: seção 14.

- **Anatomia:** largura 380 px (celular: largura da tela menos 20 px) · padding 12 px · raio 12 px · fundo `surface-raised` com contorno branco 10% e sombra · ícone 16 px na cor da variante · título 13,5 px peso 600 · descrição opcional 12,5 px `muted` (no máximo 2 linhas) · ação opcional em botão ghost compacto · botão fechar (×) de 32 px · linha de tempo de 2 px no rodapé, na cor da variante, encolhendo até sumir.
- **Variantes:** `success` (círculo com check), `error` (círculo com !), `warning` (triângulo), `loading` (spinner, sem tempo). O toast de carregamento **vira** sucesso ou erro no mesmo lugar, sem criar outro.
- **Tempo:** sucesso 4 s · com ação (Desfazer, Abrir, Ver) 6 s · erro e carregando ficam até serem resolvidos ou fechados. Mouse em cima pausa o tempo.
- **Pilha:** no máximo 3; o mais antigo sai primeiro. Desktop: canto inferior direito, 20 px das bordas. Celular: topo, abaixo da barra de status, ação com 44 px.
- **Entrada:** sobe 8 px em 200 ms (é resposta a uma ação, não animação de entrada da página). Com movimento reduzido, aparece direto.
- **Teclado:** `Esc` fecha o último; a ação é alcançável por Tab.

### 13.13 Alerta em linha

Aviso que pertence a uma área da tela e não some (segredo exposto no .env, dados só no navegador, backup atrasado, confirmação de esvaziar a lixeira).

- Faixa com ícone 16 px e texto, raio 12 px, cor da variante (warning, danger, info) seguindo a regra do badge (fundo a 10–12%, contorno a 24%).
- Título 14 px peso 600 em `text`, descrição 13 px; ações à direita em ghost.

### 13.14 Carregamento

Regra de quando usar cada um: seção 15.

- **Spinner:** 16 px, anel de 2,5 px com trilho a 20% e arco na cor do texto, uma volta a cada 0,9 s.
- **Barra de progresso:** 6 px de altura, raio 999, trilho branco 6%, preenchimento sólido `#EDEEF2`; só para progresso real.
- **Anel de cobertura:** mesmo traço da barra, em círculo, com a porcentagem ao lado.
- **Etapas:** lista vertical; cada etapa com círculo de 22 px (feita: check verde; atual: spinner; futura: contorno apagado), texto 13,5 px e detalhe mono à direita ("12/18 arquivos"). Embaixo, barra de progresso, uma frase de contexto e **Cancelar**.
- **Skeleton:** blocos com raio 6 px e fundo branco 6%, **parados** (sem brilho passando), desenhando a forma real da tela. No mapa, os contornos das zonas aparecem tracejados nas cores delas.
- **Mini-mapa (carregamento do mapa):** 5 pontos nas cores das zonas que acendem em sequência enquanto linhas de fluxo vão ligando um ao outro, em loop de 2,4 s. Embaixo, uma frase em 14 px que troca a cada 2 s: "Escrevendo o prólogo…", "Ligando os pontos…", "Separando as zonas…", "Contando as variáveis…", "Desenhando os fluxos…". Com movimento reduzido: pontos acesos e parados, só a frase muda.

### 13.15 Tecla

Atalho de teclado (`Ctrl K`, `Esc`).

- Altura 20 px, padding 0 6 px, raio 6 px, Geist Mono 11 px, fundo branco 6%, contorno inferior de 1 px mais forte.

### 13.16 Item do mapa

- Card de 168 × 48 px, raio 12 px, fundo #12151B, ponto de 8 px na cor da zona, nome 13 px peso 500 e situação 11,5 px abaixo ("Decidido", "A decidir", "Futuro").
- **Decidido:** contorno branco 12%. **A decidir:** contorno tracejado `warning`, situação em `warning`. **Futuro:** opacidade 60%. **Novo para você:** ponto `accent` de 7 px à direita. **Selecionado:** contorno 1,5 px `text` + halo de 4 px.

## 14. Quando usar toast

O toast confirma o resultado de uma ação **que não aparece sozinho na tela** ou que **pode ser desfeita**. Se o resultado já está visível, não há toast.

| Área | Situação | Toast |
|---|---|---|
| Projetos | Projeto criado | Sucesso "Projeto criado" + **Abrir** |
| Projetos | Status alterado | Sucesso "Status: Pausado" + **Desfazer** |
| Projetos | Projeto duplicado | Sucesso "Cópia criada" + **Abrir** |
| Projetos | Projeto excluído | Sucesso "Projeto movido para a lixeira" + **Desfazer** |
| Projetos | Projeto arquivado / restaurado | Sucesso + **Desfazer** |
| Mapa | Item, zona ou conexão excluídos | Sucesso "Item removido" + **Desfazer** |
| Mapa | Item adicionado por sugestão | Sucesso "Item adicionado" |
| Mapa | Opção escolhida para um item pendente | Sucesso "Banco: PostgreSQL" + **Desfazer** |
| Mapa | Vários itens colados ou duplicados | Sucesso "6 itens colados" |
| Mapa | Falha ao salvar | Erro fixo: "Não foi possível salvar" + o que acontece com as alterações + **Tentar de novo** |
| Checklist | Item marcado "Não se aplica" | Sucesso + **Desfazer** |
| Variáveis | Variável marcada ou desmarcada como segredo | Sucesso com o efeito ("o valor guardado foi apagado") |
| GitHub | Conta conectada | Sucesso "GitHub conectado" |
| GitHub | Importação concluída | Sucesso "18 itens e 12 variáveis importados" + **Ver no mapa** |
| GitHub | Sem acesso, arquivo não encontrado, limite da API, sessão expirada | Erro dizendo o que fazer ("Reconecte o GitHub", "Tente em 5 min") |
| GitHub | Novas divergências detectadas | Aviso "3 novas divergências" + **Revisar** |
| GitHub | Divergência resolvida | Sucesso + **Desfazer**; ao zerar: "Mapa e repositório em dia" |
| .env | Importação concluída | Sucesso "12 variáveis importadas · 2 ignoradas" |
| Exportar | Arquivo gerado | Sucesso "mapa.png baixado" |
| Exportar | Kit de início do repositório baixado | Sucesso "agenda-de-aulas.zip baixado" |
| Exportar | PR criado | Carregando → Sucesso "PR #14 aberto" + **Ver no GitHub** |
| Exportar | Copiado para a área de transferência | Sucesso "Copiado" |
| Exportar | Falha ao gerar | Erro + **Tentar de novo** |
| Backup | Backup exportado / importado | Sucesso "Backup salvo · 3 projetos" / "2 projetos importados" |
| Lixeira | Item restaurado | Sucesso "Redis restaurado" + **Abrir** |
| Lixeira | Lixeira esvaziada | Sucesso "Lixeira esvaziada" (sem Desfazer: foi confirmado antes) |
| Histórico | Versão salva / restaurada / rascunho criado | Sucesso; restaurar tem **Desfazer**, rascunho tem **Abrir** |
| Assistente (futuro) | Rascunho gerado | Sucesso "Rascunho com 14 itens" + **Revisar** |
| Compartilhar (futuro) | Link copiado, convite enviado, limite atingido | Sucesso / erro |

**Sem toast:** marcar passo do "Preparar o ambiente", mover card, trocar tema ou idioma, renomear, filtrar, navegar, cada salvamento automático (usa o indicador da barra lateral), erros de formulário (vão no campo), alertas de segredo no .env (alerta em linha).

## 15. Carregamento proporcional à espera

| Espera | O que aparece | Exemplos |
|---|---|---|
| Até 0,4 s | Nada além do estado pressionado | Trocar aba, abrir painel, filtrar, ler o .env colado |
| 0,4 a 2 s | Botão carregando, ou skeleton na área que carrega | Exportar PNG/SVG/.env.example, gerar o .zip do repositório, abrir uma tela |
| 2 a 10 s | Etapas com progresso real e Cancelar | Importar do GitHub, verificar divergências |
| Mais de 10 s | Segundo plano: toast de carregamento que vira sucesso | Abrir PR no GitHub, importar repositório grande |
| Mapa pesado (> 0,4 s) | Mini-mapa animado + frase | Abrir um projeto grande |

- Nunca tela em branco: acima de 0,4 s sempre há skeleton ou carregamento.
- Nada de spinner para esperas abaixo de 0,4 s — só cria piscada.
- Progresso só com número real; sem barra "fingindo" avanço.
- Ao terminar, o conteúdo substitui o carregamento direto.

## Checklist antes de dar uma tela por pronta

- [ ] Cada controle está junto do que controla (nenhum "recolher" no rodapé)
- [ ] No máximo uma ação primária visível
- [ ] Só usa componentes da seção 13; nenhum badge, botão ou card com estilo próprio
- [ ] Só usa os raios permitidos (seção 4)
- [ ] Badges seguem o mapeamento de estados e estão em sentence case
- [ ] Nenhuma animação ao abrir a página
- [ ] Toasts só onde a seção 14 manda; esperas seguem a seção 15
- [ ] Estados de hover, foco, carregando, vazio e erro desenhados
- [ ] Contraste AA conferido nos dois temas
- [ ] Funciona só com teclado
- [ ] Animações dentro dos tempos e com reduced-motion
- [ ] Textos seguem as regras de escrita e passam pelas traduções (nenhum texto fixo)
- [ ] Layout aguenta textos 30% maiores (en, es)
- [ ] Versão de celular desenhada (390 px), com alvos de 44 px e nada dependendo de hover
