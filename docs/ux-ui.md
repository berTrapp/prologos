# Prólogos — Regras de UX/UI

Regras que toda tela do Prólogos segue. Valem para quem desenha e quem programa. Uma tela só está pronta quando passa no checklist do fim deste documento.

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
| Ferramentas | #FACC15 | #A16207 |
| Interface | #7C5CFF | #7C5CFF |
| Aplicação | #60A5FA | #2563EB |
| Dados | #34D399 | #059669 |
| Ambiente | #FB923C | #EA580C |
| Infraestrutura | #22D3EE | #0891B2 |
| Segurança | #F87171 | #DC2626 |
| Observabilidade | #A3E635 | #4D7C0F |

No tema claro as cores de zona ficam um tom mais escuras para o texto e o traço manterem contraste AA (no mínimo 3:1 sobre `bg`; Ferramentas e Observabilidade usam o tom 700 por isso). O gradiente da marca (#7C5CFF → #22D3EE) não muda entre os temas.

## 3. Hierarquia e leitura

- Cada tela responde a uma pergunta só; o título diz qual.
- No máximo três níveis de texto por bloco: título, texto, detalhe (mono, caixa alta, cor apagada).
- Divulgação progressiva: o essencial aparece; o detalhe vai para o painel lateral, um card expandido ou uma zona aberta.
- Números importantes em tamanho grande e com rótulo curto embaixo.
- O **próximo passo** fica sempre visível no topo do mapa e do checklist. No mapa, a barra sempre leva a algum lugar: o primeiro item a decidir, a trilha "Preparar o ambiente" no checklist ou, sem nada pendente, um fluxo novo (só no desktop). A trilha incompleta conta como uma pendência.

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
- **Salvamento automático:** não gera toast. Um indicador discreto na barra lateral mostra o estado: no MVP, "Salvo neste navegador" (normal), "Salvando…" (gravando) e "Não foi possível salvar" (erro). "Salvo" fica para quando houver sincronização com o servidor.
- **Desfazer:** pilha de 100 passos por projeto, só na memória (some ao recarregar a página); para voltar mais longe, o histórico de versões.
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
- **Só aparece o que já existe:** uma página entra na barra lateral, nas abas e na paleta junto com a fase que a constrói. Enquanto Custos e GitHub não existem, as abas do celular são Mapa, Checklist, Variáveis e Mais.
- Tablet: a barra lateral começa recolhida (só ícones).
- **Mapa com pouco espaço** (por exemplo, os dois painéis abertos em 1024 px), decidido pela largura do mapa, não da janela:
  - o próximo passo desce para uma segunda linha do cabeçalho;
  - "Notas e riscos" e "Tags" ficam só com ícone e contagem, e o nome vai para a dica e para o leitor de tela;
  - a barra de fluxos sobe para cima do zoom em vez de ficar ao lado.
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
| `faint` | #7F859B | #6B7080 | rótulos mono (AA também sobre `surface-raised`) |
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
  - Checklist: decidido → success · a decidir → warning · futuro → info · não se aplica → neutral · falta no mapa → warning
  - Variáveis: segredo → danger · pública → info · configuração → neutral
  - Novo para você → accent (com ponto) · Recomendado (para começar) → accent
  - Nota → info · Risco → danger · Futuro → planned · tipo do item na lixeira → neutral
- **Regras:** texto de 1 a 3 palavras; largura pelo conteúdo (sem largura fixa); no máximo dois badges lado a lado; não usar badge para o que é ação (isso é botão) nem para tecnologia (isso é chip).

### 13.3 Contador

Número de pendências num item de navegação ou aba.

- Pílula de 18 px (16 px no celular, sobre o ícone da aba) · padding 0 5 px · fundo `#FBBF24` sólido, texto `#1A1305` · Geist 11 px peso 700.
- Só aparece com valor maior que zero; acima de 99 mostra "99+".
- É o único elemento com fundo sólido amarelo no app. Igual nos dois temas.

### 13.4 Status com ponto

Status de projeto ("Em desenvolvimento", "Planejando", "Pausado") e de conexão.

- Ponto de 6 px na cor do status + texto 12 px em `muted`. Sem fundo, sem contorno.
- Usado nas listas de projetos (desktop e celular) e no rodapé de cards.

### 13.5 Chip

Nome de tecnologia, chave, comando ou valor técnico (React, `DATABASE_URL`, `php artisan migrate`).

- Altura 24 px · padding 0 8 px · raio 6 px · Geist Mono 11,5 px · fundo branco 4% + contorno interno 8% · texto #C3C8D6 (claro: fundo preto 4%, contorno 8%, texto #3A3F4C).
- Com ação (remover, filtrar, sugestão clicável) ganha o estado hover e, para remover, um × de 12 px; sem ação, é estático.
- Comando longo (trilha "Preparar o ambiente") quebra em mais linhas em vez de ser cortado; a altura cresce, o resto não muda.

### 13.6 Tag de zona

Identifica a zona do mapa (Metodologia, Infraestrutura…).

- Quadrado de 6 px com raio 2 px na cor da zona + nome em 12 px. Sem fundo.
- É o único lugar onde as cores de zona aparecem fora do mapa.

### 13.7 Botão

- **Primário:** fundo sólido `#EDEEF2`, texto `#0B0D12` (claro: fundo `#12141A`, texto `#FFFFFF`). Um por tela.
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

- **Campo de texto:** altura 36 px (44 no toque, com texto de 16 px), raio 8 px, fundo branco 3%, contorno 8%; foco com anel violeta de 2 px. Rótulo sempre visível acima, nunca só placeholder. Área de texto: raio 12 px, fundo #0A0C10 (claro: #F1F2F5).
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
- **Barra de progresso:** 6 px de altura, raio 999, trilho branco 6%, preenchimento sólido `#EDEEF2` (claro: `#12141A`); só para progresso real.
- **Anel de cobertura:** mesmo traço da barra, em círculo, com a porcentagem ao lado.
- **Etapas:** lista vertical; cada etapa com círculo de 22 px (feita: check verde; atual: spinner; futura: contorno apagado), texto 13,5 px e detalhe mono à direita ("12/18 arquivos"). Embaixo, barra de progresso, uma frase de contexto e **Cancelar**.
- **Skeleton:** blocos com raio 6 px e fundo branco 6%, **parados** (sem brilho passando), desenhando a forma real da tela. No mapa, os contornos das zonas aparecem tracejados nas cores delas.
- **Mini-mapa (carregamento do mapa):** 5 pontos nas cores das zonas que acendem em sequência enquanto linhas de fluxo vão ligando um ao outro, em loop de 2,4 s. Embaixo, uma frase em 14 px que troca a cada 2 s: "Escrevendo o prólogo…", "Ligando os pontos…", "Separando as zonas…", "Contando as variáveis…", "Desenhando os fluxos…". Com movimento reduzido: pontos acesos e parados, só a frase muda.

### 13.15 Tecla

Atalho de teclado (`Ctrl K`, `Esc`).

- Altura 20 px, padding 0 6 px, raio 6 px, Geist Mono 11 px, fundo branco 6%, contorno inferior de 1 px mais forte.

### 13.16 Item do mapa

- Card de 168 × 48 px, raio 12 px, fundo #12151B (claro: #FFFFFF), ponto de 8 px na cor da zona, nome 13 px peso 500 e situação 11,5 px abaixo ("Decidido", "A decidir", "Futuro").
- **Decidido:** contorno branco 12%. **A decidir:** contorno tracejado `warning`, situação em `warning`. **Futuro:** opacidade 60%. **Novo para você:** ponto `accent` de 7 px à direita. **Selecionado:** contorno 1,5 px `text` + halo de 4 px.
- **Notas e riscos** (com "Notas e riscos" ligado no mapa): selo de 10,5 px acima do canto direito do card, fundo `bg`, raio 6 px, com o ícone de nota e a contagem e, se houver risco aberto, o triângulo na cor da severidade mais alta (alta `danger`, média `warning`, baixa `muted`) e a contagem. O texto completo fica no painel de detalhes.
- **Escolha feita:** um item pendente decidido por uma opção mostra a opção no lugar da situação ("PostgreSQL").
- **Não se aplica** (RN 5): situação "Não se aplica" em `muted`, card com opacidade 50% e contorno `border`; não entra no próximo passo.

### 13.17 Estado vazio

Tela ou área sem conteúdo (nenhum projeto, zona vazia, busca sem resultado) ou que não abriu (erro). É um convite: diz o que falta e oferece a ação.

- **Anatomia:** centralizado na área · ícone Lucide 16 px dentro de quadrado de 44 px (raio 12, fundo branco 4% / preto 4% no claro, contorno `border`) · título 16 px peso 600 em `text` · uma frase 13,5 px em `muted`, no máximo 2 linhas e 420 px de largura · ações 16 px abaixo.
- **Ações:** no máximo duas; no máximo uma primária (só se a tela não tiver outra), as demais ghost.
- **Variantes:** `empty` (convite) e `error` (ícone de triângulo; diz o que aconteceu e o que fazer).
- **Regras:** nunca ilustração nem emoji; o texto não culpa a pessoa; busca sem resultado repete o termo buscado.

### 13.18 Menu

Lista de ações ancorada num botão (ações de um card de projeto, "Mais" no celular).

- **Base:** Radix DropdownMenu. Abre com clique, toque, Enter, Espaço ou seta para baixo; setas navegam; `Esc` fecha e devolve o foco ao botão.
- **Anatomia:** raio 12, fundo `surface-raised` com contorno 10%, padding 4 px, largura mínima 200 px. Item com 32 px (44 no toque), raio 8, ícone 16 px, texto 13 px; hover e foco com fundo branco 6%.
- **Grupos:** separador de 1 px `border`; rótulo de grupo opcional em mono 11 px `faint`.
- **Destrutivo:** sempre o último grupo, separado, texto e ícone em `danger`.
- **Seleção:** item escolhível (status) mostra um check à direita; nunca só a cor.
- O botão que abre o menu é um botão só ícone (13.7) com `aria-label`.

### 13.19 Lista de opções

Escolha única em telas de toque quando as opções não cabem num controle segmentado (idioma e tema nas Configurações do celular).

- **Base:** Radix RadioGroup; setas mudam a escolha; o grupo tem nome (rótulo visível acima).
- **Anatomia:** dentro de um card; rótulo do grupo 13 px peso 600 em `muted`; cada opção é uma linha de 48 px com o texto em 16 px à esquerda e o indicador à direita; linhas separadas por 1 px `border`.
- **Indicador:** círculo de 22 px com contorno `stroke-strong`; marcado, fundo `text` com miolo `bg` de 8 px. Nunca só cor: a forma muda.
- No desktop, a mesma escolha usa o controle segmentado (13.8).

### 13.20 Cartão de escolha

Escolha única entre opções que precisam de uma frase de explicação (tipo de projeto, kit, onde roda). Usado no início guiado.

- **Base:** Radix RadioGroup; setas mudam a escolha; o grupo tem rótulo visível acima.
- **Anatomia:** card de raio 12 px, fundo `surface`, contorno interno 1 px `border`, padding 14 × 16 px · indicador de rádio de 18 px à esquerda (mesma forma da 13.19) · título 14,5 px peso 500 em `text` · descrição 13 px em `muted`, até 2 linhas · selo opcional à direita do título (Badge `accent` "Recomendado para começar").
- **Estados:** hover com contorno `stroke-strong`; **marcado** com contorno 1,5 px `text` e fundo `fill-subtle`, e o indicador preenchido (nunca só cor); foco com anel de 2 px.
- **Layout:** grade de até 3 colunas no desktop; uma coluna no celular, com altura mínima de 56 px.
- **Com ícone** (formatos do Exportar): no lugar do indicador de rádio, um quadro de 32 px com raio 8 px, fundo `fill` e contorno `border`, com o ícone Lucide de 16 px na cor que identifica o formato (token de zona); título em Geist Mono 13,5 px. Marcado continua com contorno 1,5 px `text` e fundo `fill-subtle`.

### 13.21 Miniatura do mapa

Prévia parada do mapa, sem interação (prévia do início guiado; mais tarde, o card do projeto).

- **Anatomia:** grade de 3 colunas com as zonas na ordem do projeto · cada zona com raio 8 px, contorno interno e fundo na cor da zona (30% e 5%, os mesmos da tag de zona), nome 10,5 px peso 600 na cor da zona · itens como linhas de 18 px, raio 6 px, texto Geist 10,5 px.
- **Itens:** decidido com contorno `border`; **pendente** com contorno tracejado `warning` e texto `warning`; **novo para você** com ponto `accent` de 5 px à direita. Itens futuros não aparecem (visão Hoje).
- **Legenda** embaixo: Decidido · Pendente · Novo para você, com a mesma forma de cada um. Números em 22 px peso 600: decididos (`text`), a decidir (`warning`), novos para você (`accent`).
- Zona com mais de 4 itens mostra "+N". Sem animação; muda na hora quando a resposta muda.

### 13.22 Passos de um assistente

Navegação entre os passos de um fluxo guiado (início guiado). Não confundir com os passos de carregamento (13.14).

- **Lista (desktop):** coluna de linhas de 48 px, raio 10 px · número num círculo de 22 px com contorno `stroke-strong` (Geist Mono 11,5 px) · rótulo 14 px e, abaixo, a resposta dada em 12,5 px `muted`. Passo atual: fundo `fill-subtle`, círculo preenchido em `text` com número em `bg`, rótulo peso 600. Passos respondidos são clicáveis e voltam direto para eles; o atual tem `aria-current="step"`.
- **Barra (celular e tablet):** um segmento de 4 px de altura por passo, raio 999, separados por 6 px; concluídos e atual em `text`, os próximos em `fill-strong`. Acompanha o texto "Passo 2 de 5" para leitores de tela.

### 13.23 Zona do mapa

Grupo que contém itens e subzonas no canvas (RN 1).

- **Anatomia:** raio 16 px (subzona: 12 px) · contorno interno 1 px na cor da zona a 30% e fundo na cor a 5% · cabeçalho de 40 px com ponto de 8 px na cor da zona, nome 13,5 px peso 600 na cor da zona e contagem em `muted` · à direita do cabeçalho, "+" (novo item), o menu "…" (renomear, cor, nova subzona, excluir) e o botão Recolher/Expandir (ux-ui 1).
- **Conteúdo:** itens em fileiras de 2 (168 px cada, 8 px entre eles) com 12 px de margem; subzonas ocupam a largura toda, abaixo dos itens.
- **Recolhida:** vira um card de 48 px de altura com o nome, a contagem e o botão Expandir; as conexões apontam para ele, com um contador quando várias se juntam.
- **Filtro:** zona fora do filtro fica com opacidade 35%.
- **Soltar:** ao arrastar um item por cima, o contorno vai a 60% e a posição de chegada aparece como uma linha de 2 px na cor da zona.

### 13.24 Conexão do mapa

- Linha de 1,5 px em `stroke-strong`, curva suave, seta de 8 px no destino; rótulo do tipo em Geist Mono 11 px `muted`, sobre um fundo `bg` com raio 6 px.
- **Selecionada:** linha em `text`. **Toca item futuro na visão Hoje dentro de um fluxo:** tracejada. **Lacuna de fluxo:** não desenha a linha; o player mostra "Trecho removido".
- **Fluxo ativo:** traço de 2 px com o gradiente da marca e tracejado andando (1,2 s por ciclo); com `prefers-reduced-motion`, parado.
- **Agrupada** (zona recolhida): rótulo com a contagem ("3 conexões").

### 13.25 Marca de decisão

Círculo que diz se uma decisão está resolvida (checklist, decisões essenciais do Pronto para codar).

- **Resolvida:** círculo de 18 px preenchido em `success`, com check de 12 px em `bg` (traço 3).
- **Em aberto:** círculo de 18 px vazio, contorno 1,5 px `stroke-strong`.
- A forma muda, não só a cor. É decorativa (`aria-hidden`): o texto da linha diz o estado.

### 13.26 Linha de decisão

Uma decisão essencial do Pronto para codar (RN 16).

- **Anatomia:** linha de no mínimo 48 px separada por 1 px `border` · marca de decisão (13.25) à esquerda · rótulo 14 px em `text` · detalhe à direita em 13 px, até 55% da largura, quebrando linha em vez de cortar: resolvida em `muted` (a escolha, "6 variáveis"), em aberto em `warning` ("A decidir", "1 de 4").
- Não é clicável; o caminho para decidir é o "Abrir o checklist" embaixo da lista.

### 13.27 Marco

Mostra em que ponto o projeto está de um marco com duas etapas ("Faltam 3 · Pronto").

- **Anatomia:** a mesma forma do controle segmentado (13.8), mas **não é clicável**: a etapa atual tem fundo `fill-active`, sombra leve e texto `text`; a outra fica em `faint`. Texto Geist 13 px peso 500, altura 32 px (44 no celular, ocupando a largura).
- **Acessibilidade:** é um texto (`role="status"`), lido como "Faltam 3 decisões essenciais" ou "Pronto para codar"; as etapas são `aria-hidden`.

### 13.28 Arquivos e prévia

Lista de arquivos gerados com a prévia do selecionado (Pronto para codar, Exportar).

- **Lista:** Radix Tabs. Quando o card tem 560 px ou mais (container query, não a largura da tela), coluna de 208 px à esquerda com linhas de 36 px (44 no toque), raio 8 px, Geist Mono 13 px em `muted`; selecionada com fundo `fill-strong` e texto `text`. Mais estreito, a lista vira uma fileira rolável de abas em cima da prévia, sem barra de rolagem visível.
- **Prévia:** fundo `textarea`, raio 12 px (dentro de card) · cabeçalho de 48 px com o nome do arquivo em Geist Mono 13 px, a contagem de linhas em Geist Mono 12 px `faint` e, à direita, "Copiar" (botão ghost compacto) · conteúdo em Geist Mono 12,5 px com entrelinha 1,7, `text`, padding 20 × 24 px, rolagem nos dois eixos, `tabindex="0"` para rolar pelo teclado.
- Imagem e página (`mapa.png`, `mapa.html`) usam o mesmo cabeçalho, com a imagem ajustada à área ou a página num `iframe` isolado; no lugar de "Copiar", a imagem tem o controle segmentado PNG / SVG.
- Somente leitura; copiar dá o toast "Copiado" (seção 14).

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
