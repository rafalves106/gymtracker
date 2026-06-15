# UX Review - Mobile Core (GymTracker)

> Por: UI/UX Agent
> Data: 2026-06-15
> Escopo: frontend/src/pages, frontend/src/features, frontend/src/components, frontend/src/index.css, frontend/src/main.tsx, frontend/index.html
> Persona alvo: nao informado no repositorio (PROJECT_MAP.md e briefings ausentes)

---

## Veredicto

**[ALTERACOES NECESSARIAS]**

- Bloqueantes (acessibilidade ou jornada quebrada): 3
- Altos (heuristica violada com impacto real): 4
- Medios (consistencia e polish): 6
- Sugestoes (proximo nivel): 3

---

## A. Heuristicas de Nielsen

| #   | Heuristica             | Status | Achado (se houver)                                                                                          |
| --- | ---------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| 1   | Visibilidade do status | ⚠️     | Loading com texto simples e sem estado de erro padronizado em mutacoes (ex.: inicio/finalizacao de sessao). |
| 2   | Mundo real             | ✅     | Linguagem geral em PT-BR e termos coerentes com contexto fitness.                                           |
| 3   | Controle e liberdade   | ⚠️     | Modal fecha ao clicar no overlay sem confirmacao de perda de dados em formulario em andamento.              |
| 4   | Consistencia e padroes | ❌     | Uso misto de design tokens e cores hardcoded em varios CSS.                                                 |
| 5   | Prevencao de erros     | ❌     | Formulario de treino invalido apenas retorna silenciosamente, sem feedback para usuario.                    |
| 6   | Reconhecer > lembrar   | ✅     | Labels e textos de acao estao visiveis na maior parte dos fluxos.                                           |
| 7   | Flexibilidade          | ⚠️     | DnD com suporte a teclado existe, mas sem hints de atalho/uso para iniciantes.                              |
| 8   | Minimalismo            | ✅     | Interface enxuta, com baixo ruido visual no fluxo principal.                                                |
| 9   | Recuperacao de erros   | ⚠️     | Login exibe erro, mas fluxos de criacao/controle de treino nao padronizam mensagens de falha.               |
| 10  | Ajuda e documentacao   | ⚠️     | Falta ajuda contextual para interacoes menos obvias (DnD no mobile e controles da sessao).                  |

---

## B. Acessibilidade (WCAG 2.1 AA)

| Criterio                                 | Status | Evidencia                                                                                                                                                                                                      |
| ---------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Imagens com alt                          | ✅     | Nao ha imagens funcionais sem alt no fluxo principal autenticado; ocorrencias estao em arquivo de template (App.tsx).                                                                                          |
| Botoes com label acessivel               | ✅     | Botoes iconicos com aria-label em [src/features/session/ExerciseCard.tsx:46](src/features/session/ExerciseCard.tsx#L46).                                                                                       |
| Contraste texto normal >= 4.5:1          | ❌     | Texto #666 em fundo escuro em [src/features/workouts/WeekBoard.css:83](src/features/workouts/WeekBoard.css#L83) e [src/features/settings/Settings.css:78](src/features/settings/Settings.css#L78).             |
| Contraste texto grande >= 3:1            | ⚠️     | Maioria adequada, mas variacoes hardcoded elevam risco de regressao no tema claro.                                                                                                                             |
| Foco visivel em todos elementos          | ⚠️     | Regra global existe em [src/index.css:89](src/index.css#L89), mas sem garantia de contraste ideal em todos fundos hardcoded.                                                                                   |
| Navegacao por teclado completa           | ⚠️     | DnD tem KeyboardSensor em [src/features/workouts/WeekBoard.tsx:78](src/features/workouts/WeekBoard.tsx#L78), porem modal sem foco inicial/trap.                                                                |
| Hierarquia de heading correta (h1→h2→h3) | ⚠️     | Paginas autenticadas iniciam em h2 sem h1 estrutural (ex.: [src/pages/WorkoutsPage.tsx:48](src/pages/WorkoutsPage.tsx#L48)).                                                                                   |
| lang no HTML root                        | ❌     | HTML esta em ingles: [index.html:2](index.html#L2).                                                                                                                                                            |
| Forms com labels associadas              | ✅     | Labels presentes no login e formulario de treino (ex.: [src/pages/LoginPage.tsx:46](src/pages/LoginPage.tsx#L46)).                                                                                             |
| Mensagens de erro acessiveis (aria-live) | ⚠️     | Login usa role=alert [src/pages/LoginPage.tsx:86](src/pages/LoginPage.tsx#L86), mas criacao de treino invalido nao informa erro.                                                                               |
| Touch targets >= 44x44px (mobile)        | ❌     | Toggle de tema com 56x30 em [src/features/settings/Settings.css:107](src/features/settings/Settings.css#L107) e botoes 40x40 em [src/features/session/Session.css:155](src/features/session/Session.css#L155). |
| Sem dependencia so de cor pra informacao | ⚠️     | Status usa texto + cor (bom), mas alguns estados secundarios dependem fortemente de contraste cromatico.                                                                                                       |

---

## C. Design System

- Tokens usados consistentemente? **Nao.** Cores hardcoded em [src/pages/LoginPage.css:22](src/pages/LoginPage.css#L22), [src/features/session/Session.css:128](src/features/session/Session.css#L128), [src/features/workouts/WeekBoard.css:25](src/features/workouts/WeekBoard.css#L25).
- Componentes reutilizados? **Parcial.** Classes globais de botao sao reutilizadas, mas com definicoes duplicadas entre arquivos.
- Espacamentos seguem escala? **Parcial.** Ha consistencia basica, sem escala documentada e com variacoes pontuais.
- Tipografia segue escala? **Parcial.** Tamanhos coerentes, mas sem tokenizacao formal de type scale.
- Variantes de componente documentadas? **Nao.** Nao ha documentacao de variantes/estados.

---

## D. Estados tratados

| Estado                 | Coberto? | Como?                                                                     |
| ---------------------- | -------- | ------------------------------------------------------------------------- |
| Loading                | ✅       | Textos "Carregando..." em telas de treinos/sessao.                        |
| Erro                   | ⚠️       | Login trata erro; demais fluxos nao exibem erro consistente para usuario. |
| Vazio (empty state)    | ✅       | Mensagens de vazio em treino e sessao.                                    |
| Sucesso                | ⚠️       | Sucesso implicito (ex.: fechar modal apos criar), sem feedback explicito. |
| Sem permissao          | ❌       | Nao ha estado UX dedicado para autorizacao/forbidden.                     |
| Offline (se aplicavel) | ❌       | Nao ha tratamento de indisponibilidade de rede no UI.                     |

---

## E. Achados detalhados

### 🔴 [UX-001] Modal sem semantica de dialog e sem gerenciamento de foco

- Arquivo: [src/features/workouts/CreateWorkoutForm.tsx:52](src/features/workouts/CreateWorkoutForm.tsx#L52)
- Heuristica violada: #3 Controle e liberdade + #5 Prevencao de erros
- WCAG: 2.1.1 Keyboard / 2.4.3 Focus Order / 4.1.2 Name, Role, Value
- Risco: usuario de teclado/leitor de tela pode "vazar" do modal e perder contexto
- Sugestao:
- Definir container como dialog modal (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`)
- Mover foco inicial para o titulo/campo principal
- Implementar focus trap e fechamento por Esc com retorno de foco ao botao que abriu

### 🔴 [UX-002] Touch targets abaixo do minimo recomendado em controles mobile

- Arquivos: [src/features/settings/Settings.css:107](src/features/settings/Settings.css#L107), [src/features/session/Session.css:155](src/features/session/Session.css#L155)
- WCAG: 2.5.5 Target Size (enhanced guidance para mobile)
- Risco: erro de toque e fadiga, especialmente em uso durante treino
- Sugestao:
- Aumentar area clicavel minima para pelo menos 44x44px
- Se manter visual compacto, usar hit-area maior com pseudo-elemento ou padding invisivel

### 🔴 [UX-003] Idioma do documento nao corresponde ao idioma do produto

- Arquivo: [index.html:2](index.html#L2)
- WCAG: 3.1.1 Language of Page
- Risco: pronunciacao incorreta em leitores de tela e pior compreensao assistiva
- Sugestao: alterar para `lang="pt-BR"`

### 🟠 [UX-004] Falta feedback de validacao ao bloquear submit no formulario de treino

- Arquivo: [src/features/workouts/CreateWorkoutForm.tsx:47](src/features/workouts/CreateWorkoutForm.tsx#L47)
- Heuristica violada: #5 Prevencao de erros + #9 Recuperacao de erros
- Risco: usuario tenta salvar e nada acontece (falha silenciosa)
- Sugestao: exibir mensagem clara em PT-BR, com `aria-live="polite"`, indicando o que falta preencher

### 🟠 [UX-005] Contraste insuficiente em textos secundarios no tema escuro

- Arquivos: [src/features/workouts/WeekBoard.css:83](src/features/workouts/WeekBoard.css#L83), [src/features/settings/Settings.css:78](src/features/settings/Settings.css#L78), [src/features/settings/Settings.css:101](src/features/settings/Settings.css#L101)
- WCAG: 1.4.3 Contrast (Minimum)
- Risco: baixa legibilidade em telas com brilho reduzido/exteriores
- Sugestao: substituir #666/#555 por tokens com contraste validado (ex.: `var(--text-muted)`)

### 🟠 [UX-006] Responsividade baseada em container fixo, sem breakpoints dedicados

- Arquivos: [src/components/Layout.css:5](src/components/Layout.css#L5), [src/features/workouts/Workouts.css:120](src/features/workouts/Workouts.css#L120)
- Heuristica violada: #7 Flexibilidade e eficiencia
- Risco: densidade ruim em telas muito estreitas e pouco aproveitamento em tablets
- Sugestao: adicionar breakpoints para <=375px e >=768px (stack/spacing/tipografia)

### 🟠 [UX-007] Boot de tema ignora preferencia do sistema na primeira visita

- Arquivo: [src/main.tsx:16](src/main.tsx#L16)
- Heuristica violada: #4 Consistencia e padroes
- Risco: comportamento inconsistente com o que o usuario configurou no SO
- Sugestao: no boot, aplicar mesma regra de fallback do hook (`prefers-color-scheme`)

### 🟡 [UX-008] Inconsistencia de design tokens (hardcoded colors)

- Arquivos: [src/pages/LoginPage.css:22](src/pages/LoginPage.css#L22), [src/features/session/Session.css:128](src/features/session/Session.css#L128), [src/features/workouts/WeekBoard.css:25](src/features/workouts/WeekBoard.css#L25)
- Impacto: manutencao e regressao de contraste entre temas
- Sugestao: migrar para `var(--*)` em 100% dos componentes

### 🟡 [UX-009] Fechamento de modal ao clicar fora sem confirmacao de descarte

- Arquivo: [src/features/workouts/CreateWorkoutForm.tsx:52](src/features/workouts/CreateWorkoutForm.tsx#L52)
- Impacto: perda acidental de dados digitados
- Sugestao: confirmar descarte quando formulario estiver dirty

### 🟡 [UX-010] Navegacao inferior com alvo de toque possivelmente curto

- Arquivo: [src/components/Layout.css:29](src/components/Layout.css#L29)
- Impacto: menor precisao em dispositivos pequenos
- Sugestao: garantir altura minima de 44px por item

### 🟢 [UX-011] Upgrade de loading para skeleton

- Arquivos: [src/pages/WorkoutsPage.tsx:57](src/pages/WorkoutsPage.tsx#L57), [src/pages/SessionPage.tsx:76](src/pages/SessionPage.tsx#L76)
- Sugestao: skeleton alinhado ao layout final para reduzir percepcao de espera

### 🟢 [UX-012] Melhorar onboarding de DnD no mobile

- Arquivo: [src/pages/WorkoutsPage.tsx:55](src/pages/WorkoutsPage.tsx#L55)
- Sugestao: hint visual inicial com gesto e CTA "Entendi"

### 🟢 [UX-013] Feedback de sucesso explicito

- Arquivo: [src/pages/WorkoutsPage.tsx:26](src/pages/WorkoutsPage.tsx#L26)
- Sugestao: toast "Treino criado com sucesso" e "Treino agendado"

---

## Pontos positivos

- Boa estrutura de navegacao principal com `nav` nomeada em [src/components/Layout.tsx:11](src/components/Layout.tsx#L11).
- Uso de `role=alert` no erro de login em [src/pages/LoginPage.tsx:86](src/pages/LoginPage.tsx#L86).
- DnD com suporte de teclado em [src/features/workouts/WeekBoard.tsx:78](src/features/workouts/WeekBoard.tsx#L78).
- Foco visivel global definido em [src/index.css:89](src/index.css#L89).

---

## Checklist resumido (para PR)

- [ ] Heuristicas Nielsen - 10/10 sem violacao
- [ ] WCAG 2.1 AA - 12/12 criterios OK
- [ ] Design system - tokens e componentes consistentes
- [ ] Estados - loading, erro, vazio, sucesso cobertos
- [ ] Mobile - testado em 375px e >=1024px
- [ ] Teclado - jornada completa sem mouse (incluindo modal)

---

## Proximo passo

Retornar para desenvolvimento com prioridade imediata em `UX-001`, `UX-002` e `UX-003`, depois revalidar acessibilidade mobile antes do merge.
