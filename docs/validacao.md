# Prólogos — Validação com 5 pessoas

Roteiro da validação da RN 21, feita antes de qualquer fase depois do MVP. Cada pessoa usa o Prólogos sozinha, no tempo dela, anota os próprios horários e depois responde a um questionário. Ninguém observa nem ajuda.

## 1. O que queremos saber

- **Pergunta central:** uma pessoa do público principal cria um projeto do zero sem ajuda?
- **Tempo até o primeiro mapa:** do momento em que abre o link até o mapa do projeto aparecer, depois de "Criar projeto" no início guiado. Meta: menos de 10 minutos.
- **Chegou ao Pronto para codar:** contamos dois níveis.
  - **Abriu:** chegou à tela "Pronto para codar" (pelo checklist, pelo Exportar ou pela busca).
  - **Fechou:** a tela mostra o título "Pronto para codar", e não "Quase pronto para codar", ou seja, as decisões essenciais estão fechadas (RN 16).
- **Onde travou:** cada ponto em que a pessoa parou, voltou atrás ou desistiu. É daqui que saem os ajustes.

## 2. Quem convidar

- Público principal: dev em início de carreira ou estudante, que trabalha sozinho em projetos pessoais ou de portfólio.
- Tem uma ideia de projeto real, mesmo pequena. Ideia inventada na hora esconde os problemas do início guiado.
- Nunca usou o Prólogos e não acompanhou o desenvolvimento.
- Pelo menos 2 das 5 pessoas vão começar numa stack que ainda não dominam, para testar "Novo para você" e a trilha "Preparar o ambiente".
- Convide 6 ou 7: alguém sempre some. Valem as 5 primeiras respostas completas.

## 3. Antes de enviar

- [ ] Abrir https://prologos-app.pages.dev numa janela anônima e criar um projeto até o mapa, para garantir que o site está no ar.
- [ ] Anotar o commit publicado (aba Deployments do projeto no Cloudflare) na seção 7.
- [ ] Criar o questionário (seção 6) num formulário online e copiar o link para a mensagem de convite.
- [ ] Separar fora do repositório a lista de quem recebeu o convite, com o código de cada pessoa (P1, P2…).

## 4. Mensagem de convite

Pronta para colar e trocar o que está entre colchetes:

> Oi, [nome]. Estou testando o Prólogos, uma ferramenta gratuita que ajuda a planejar um projeto de software antes de começar a codar. Queria ver se dá para usar sem nenhuma explicação minha.
>
> Leva uns 30 minutos, no computador, quando for melhor para você nesta semana. As instruções estão abaixo. No fim, tem um questionário de 5 minutos: [link do formulário].
>
> Não existe resposta certa: se algo travar ou não fizer sentido, é exatamente isso que eu preciso saber. Seu nome não aparece em nenhum resultado.

## 5. Instruções para a pessoa

Vão junto com o convite.

1. Use um computador (não o celular) e tenha uma ideia de projeto em mente.
2. Anote a hora em que abrir o link: https://prologos-app.pages.dev
3. Crie um projeto do zero para a sua ideia. Não peça ajuda e não procure tutorial: use só o que aparece na tela.
4. Anote a hora em que o mapa do seu projeto aparecer.
5. Continue a partir daí até onde fizer sentido para você. Se chegar à tela "Pronto para codar", anote a hora e o título que aparece no topo.
6. Se ficar mais de 5 minutos travado no mesmo lugar, anote onde foi. Você pode parar ali.
7. Não digite senhas nem chaves de verdade. Seus projetos ficam só no seu navegador; o Prólogos não envia nada para ninguém.
8. Responda ao questionário com as anotações em mãos.

Ficha para preencher durante o uso:

| O quê | Anotação |
| --- | --- |
| Hora em que abri o link | |
| Hora em que o mapa apareceu | |
| Cheguei à tela "Pronto para codar"? Que horas? | |
| Título no topo dessa tela | |
| Onde travei (se travei) | |

## 6. Questionário

Para montar no formulário online. As perguntas 1 a 5 copiam a ficha.

1. Hora em que abriu o link.
2. Hora em que o mapa apareceu.
3. Chegou à tela "Pronto para codar"? Sim ou não; se sim, a hora.
4. Que título apareceu no topo dela: "Pronto para codar" ou "Quase pronto para codar"?
5. Ficou travado em algum momento? Onde, e o que fez para sair?
6. Há quanto tempo você programa, e em que linguagens se sente à vontade?
7. Que stack você escolheu? Ela era nova para você?
8. Teve alguma palavra ou tela que você não entendeu? Qual?
9. O que você esperava encontrar e não encontrou?
10. Usaria o Prólogos para começar o seu próximo projeto? Por quê?
11. De 0 a 10, quanto recomendaria o Prólogos para alguém começando um projeto?
12. Mais alguma coisa que queira contar?

## 7. Resultados

Só códigos e números entram aqui. As respostas brutas e a lista de nomes ficam fora do repositório.

Commit testado: `________`

| Pessoa | Programa há | Stack (nova?) | Tempo até o mapa | Pronto para codar | Travou em | Nota (0 a 10) |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | | | | | | |
| P2 | | | | | | |
| P3 | | | | | | |
| P4 | | | | | | |
| P5 | | | | | | |

Na coluna "Pronto para codar", use "Fechou", "Abriu" ou "Não chegou" (seção 1).

## 8. Como decidir

- **Meta do tempo:** atingida se pelo menos 4 das 5 pessoas chegaram ao mapa em menos de 10 minutos.
- **Criar sem ajuda:** atingido se as 5 chegaram ao mapa sem desistir. Quem desistiu antes do mapa conta como falha, e o ponto em que parou vira ajuste prioritário.
- **Travamentos:** o que travou 2 pessoas ou mais é corrigido antes de seguir. O que travou só uma vira item da lista de ajustes, com a frase da pessoa.
- **Para onde vai cada ajuste (RN 21):**
  - conteúdo de uma stack → `docs/kits/` e `src/content/kits/`;
  - perguntas, ordem ou textos do início guiado → `docs/regras-de-negocio.md` (RN 13) e as traduções;
  - comportamento ou visual → `docs/regras-de-negocio.md` ou `docs/ux-ui.md`, antes do código.
- Com as metas atingidas e os ajustes prioritários feitos, a próxima fase pode começar.

## 9. Cuidados

- Os dados de cada pessoa ficam no navegador dela (RN 18). Não peça o backup (`prologos.json`): ele pode ter notas pessoais.
- Se alguém mandar print ou backup por conta própria, não guarde no repositório.
- Os resultados publicados aqui usam só P1 a P5.
