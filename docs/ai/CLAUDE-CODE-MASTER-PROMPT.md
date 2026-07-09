# PROMPT MESTRE — Claude Code · MAK Gestão (PROJETOMG)

> **Copie TUDO entre as linhas `---INÍCIO---` e `---FIM---` e cole como primeira mensagem no Claude Code.**

---

---INÍCIO---

Você está trabalhando no repositório **MAK Gestão ERP** (`PROJETOMG`).

## SUA MISSÃO AGORA

Antes de responder qualquer coisa ou escrever código:

1. **Leia integralmente** os arquivos listados abaixo (na ordem).
2. **Confirme** com um resumo estruturado: onde o projeto está, qual o próximo slice, quais regras são invioláveis.
3. **Só depois** pergunte o que eu quero fazer — ou prossiga se eu já disse a tarefa.

Não assuma memória de chats anteriores. A única fonte de verdade é o **repositório**.

---

## LEITURA OBRIGATÓRIA (ordem exata)

### Camada 0 — Entrada Claude Code
- `CLAUDE.md` (raiz do repo)
- `docs/ai/CLAUDE-CODE-GUIDE.md`
- `docs/ai/skills/cursor-skills-mapping.md`

### Camada 1 — Estado completo do projeto
- `docs/evidence/PROJECT-COMPLETE-HANDOFF.md` ← **TUDO: frontend, backend, runtime, visão, roadmap**

### Camada 2 — Regras e governança
- `README_AI.md`
- `AGENTS.md`
- `docs/engineering/AI-STARTUP-GUIDE.md`
- `docs/engineering/CONTINUITY-PROTOCOL.md`
- `docs/engineering/PROJECT-STATUS.md`
- `docs/constitution/00-MAK-CONSTITUTION.md` (pelo menos princípios e DO-NOT-DO)

### Camada 3 — Skills portáveis (equivalente Cursor Skills)
Leia **todos** os arquivos em `docs/ai/skills/`:
- `foundation-c-runtime.md` ← programa ativo (Foundation C)
- `prisma-backend.md`
- `dev-workflow.md`
- `governance-gates.md`
- `cursor-skills-mapping.md`

### Camada 4 — Runtime SSOT (somente leitura — não editar sem autorização)
- `docs/runtime-implementation/README.md`
- `docs/runtime-implementation/10-DELIVERY-PLANNING.md`
- `docs/runtime-implementation/08-DONE-CRITERIA.md`
- `docs/evidence/foundation-c4/CERTIFICATION-REPORT.md` (último slice mergeado)

### Camada 5 — Código-chave (inspecionar estrutura)
- `src/runtime/index.js`
- `src/runtime/core/bootstrap/loadRuntimeBundle.js`
- `src/App.jsx` (rotas BOS vs ERP)
- `package.json` (scripts `test:runtime`, `gate:g423-*`)

---

## CONTEXTO RÁPIDO (validar contra os arquivos acima)

| Item | Esperado |
|------|----------|
| Programa ativo | Foundation C — Runtime Bridge |
| Slices feitos | C.1–C.4 mergeados |
| Próximo slice | **C.5** — M20 Service Locator + M09 Permission |
| Testes runtime | 66/66 (`npm run test:runtime`) |
| Gates PASS | G423-01 até G423-08 |
| Código runtime | `src/runtime/` |
| UI produção ainda usa | `makBootstrap/runtimeBridge` (legado) |
| Dev | `cp .env.local.example .env.local && npm run dev` |

---

## REGRAS INVIOLÁVEIS

1. **1 slice Foundation C = 1 PR** — não antecipar C.6+ dentro de C.5
2. **Não alterar SSOT** em `docs/runtime-implementation/` (exceto `docs/evidence/`)
3. **Nenhuma decisão arquitetural nova** — conflitos resolvem upstream nos docs
4. **Runtime não query MMM/Prisma direto** — CRB via loader (D-RI-13)
5. **Fail-closed** em permissões: deny > allow > default deny
6. **Foundation/Studio frozen** (D-052) — sem engines paralelos
7. **Memória = git + docs/** — nunca chat anterior
8. **Entregar por slice:** testes + gates + `CERTIFICATION-REPORT.md` + `MODULE-DIAGRAMS.md`

---

## COMANDOS QUE VOCÊ DEVE CONHECER

```bash
npm run dev
npm run test:runtime
npm run gate:g423-01   # … até 08 (regressão)
npm run lint
npm run verify:governance
```

Branch naming: `cursor/<nome-descritivo>-0b52`

---

## FORMATO DA SUA PRIMEIRA RESPOSTA

Após ler tudo, responda **exatamente neste formato**:

```
## ✅ Leitura confirmada

### Onde estamos
[2-3 frases]

### Próximo passo oficial
[slice, módulos, gates]

### Regras que vou seguir
[lista 5-8 bullets]

### Estrutura que entendi
[runtime pipeline, pastas principais, BOS vs ERP]

### Pronto para
[Perguntar minha tarefa OU iniciar C.5 se eu pedir]
```

---

## QUANDO EU PEDIR IMPLEMENTAÇÃO

Siga sempre:
1. `docs/ai/skills/foundation-c-runtime.md`
2. `docs/ai/skills/governance-gates.md`
3. Done criteria do slice em `08-DONE-CRITERIA.md`
4. Padrão de código dos slices C.1–C.4 (errors `MAK-L3-RUNTIME-*`, `node --test`, gates em `scripts/gates/`)

---

Agora execute a leitura obrigatória e responda no formato pedido.

---FIM---
