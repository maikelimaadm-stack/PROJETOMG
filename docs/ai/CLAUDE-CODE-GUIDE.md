# Claude Code — Guia de onboarding (MAK Gestão / PROJETOMG)

**Status:** Official — Onboarding para Claude Code e assistentes CLI  
**Version:** 1.0.0  
**Effective date:** 2026-07-09  
**Complements:** [CONTINUITY-PROTOCOL.md](../engineering/CONTINUITY-PROTOCOL.md) · [AI-STARTUP-GUIDE.md](../engineering/AI-STARTUP-GUIDE.md)

---

## 1. O que este guia resolve

No **Cursor**, “Skills” (Prisma, Figma, Vercel, etc.) são injetadas automaticamente pelo plugin da IDE.

No **Claude Code**, isso **não existe** — você usa:

| Recurso | Onde está |
|---------|-----------|
| Contexto do projeto | `CLAUDE.md` (raiz) + este guia |
| Estado completo | `docs/evidence/PROJECT-COMPLETE-HANDOFF.md` |
| Regras de implementação | `README_AI.md` |
| Comandos | `AGENTS.md` |
| Skills portáveis | `docs/ai/skills/*.md` |
| Mapeamento Cursor → Claude | `docs/ai/skills/cursor-skills-mapping.md` |

---

## 2. Setup inicial (primeira vez)

```bash
git clone https://github.com/maikelimaadm-stack/PROJETOMG.git
cd PROJETOMG
git checkout main && git pull origin main

cp .env.local.example .env.local
npm install

# Opcional: abrir direto no ERP em vez do BOS
# echo 'VITE_DEFAULT_HOME_ROUTE=/CadastroEmpresas' >> .env.local

npm run dev   # http://127.0.0.1:5173
```

**Backend local (opcional):** ver `LOCAL_DEV.md` e `backend/.env.example`.

---

## 3. Prompt inicial (copiar no primeiro chat Claude Code)

Cole isto como **primeira mensagem** em cada sessão nova:

```
Você está no repositório MAK Gestão ERP (PROJETOMG).

FERRAMENTA: Claude Code (não Cursor — não há Skills automáticas).

LEITURA OBRIGATÓRIA antes de qualquer código:
1. CLAUDE.md (raiz)
2. docs/ai/CLAUDE-CODE-GUIDE.md
3. docs/evidence/PROJECT-COMPLETE-HANDOFF.md
4. README_AI.md
5. AGENTS.md

ESTADO ATUAL:
- Programa: Foundation C — Runtime Bridge (src/runtime/)
- Slices C.1–C.4 mergeados; 66 testes runtime PASS
- Próximo: C.5 — M20 Service Locator + M09 Permission Engine
- Gates: G423-20, G423-09 + regressão G423-01..08

REGRAS:
- 1 slice = 1 PR; não alterar SSOT em docs/runtime-implementation/
- Seguir padrão dos slices C.1–C.4 (errors MAK-L3-RUNTIME-*, node --test, gates)
- Memória = git + docs/, nunca chat anterior
- Skills equivalentes: docs/ai/skills/

Confirme que leu o handoff e diga qual slice vai implementar antes de codar.
```

---

## 4. Ordem de leitura por tipo de tarefa

### Qualquer implementação

| # | Arquivo |
|---|---------|
| 1 | `docs/evidence/PROJECT-COMPLETE-HANDOFF.md` |
| 2 | `README_AI.md` |
| 3 | `docs/engineering/PROJECT-STATUS.md` |
| 4 | `docs/constitution/00-MAK-CONSTITUTION.md` (se mudança estrutural) |

### Foundation C (Runtime) — tarefa atual

| # | Arquivo |
|---|---------|
| 1 | `docs/ai/skills/foundation-c-runtime.md` |
| 2 | `docs/runtime-implementation/10-DELIVERY-PLANNING.md` § slice |
| 3 | `docs/runtime-implementation/08-DONE-CRITERIA.md` |
| 4 | `docs/runtime-implementation/03-INTERFACES.md` |
| 5 | `docs/evidence/foundation-c4/CERTIFICATION-REPORT.md` (último slice) |

### Backend / Prisma / DB

| # | Arquivo |
|---|---------|
| 1 | `docs/ai/skills/prisma-backend.md` |
| 2 | `backend/prisma/schema.prisma` |
| 3 | `backend/.env.example` |

### UI / React (ERP, BOS, Studio)

| # | Arquivo |
|---|---------|
| 1 | `src/App.jsx` (rotas) |
| 2 | `src/shared/navigation/erpMenuConfig.js` |
| 3 | `docs/ai/skills/dev-workflow.md` |

### PR / governança

| # | Arquivo |
|---|---------|
| 1 | `docs/ai/skills/governance-gates.md` |
| 2 | `docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md` |

---

## 5. Comandos que você deve dominar

### Dia a dia

```bash
npm run dev                    # frontend :5173
npm run lint
npm run build
npm run test:runtime           # 66 testes Foundation C
npm run gate:g423-01 … 08      # gates runtime
```

### Antes de PR

```bash
npm run verify:governance      # ou verify:ci (mirror completo)
```

### Backend (se stack local)

```bash
cd backend
npm run prisma:generate
npm run seed
npm run dev                    # :3001
```

Lista completa: `AGENTS.md`.

---

## 6. Workflow Claude Code (sessão típica)

```
1. git pull origin main
2. Ler PROJECT-COMPLETE-HANDOFF + skill do slice
3. git checkout -b cursor/foundation-c5-locator-permission-0b52
4. Implementar SOMENTE o escopo do slice
5. npm run test:runtime && npm run gate:g423-09 && gate:g423-20 && regressão 01-08
6. docs/evidence/foundation-c5/CERTIFICATION-REPORT.md + MODULE-DIAGRAMS.md
7. git commit / push / PR
```

---

## 7. O que NÃO fazer

- ❌ Assumir memória de sessões Cursor anteriores
- ❌ Alterar `docs/runtime-implementation/` (SSOT) sem autorização
- ❌ Implementar C.6+ dentro do PR de C.5
- ❌ Query Prisma/MMM direto de `src/runtime/` (D-RI-13)
- ❌ Criar engines paralelos em Studio (D-052 freeze)
- ❌ Pular gates antes de merge

---

## 8. Skills portáveis (`docs/ai/skills/`)

| Arquivo | Substitui Skill Cursor de… |
|---------|---------------------------|
| `foundation-c-runtime.md` | Runtime / Foundation C (projeto) |
| `prisma-backend.md` | prisma-cli-* (migrate, generate, seed…) |
| `dev-workflow.md` | bootstrap, vercel-cli, env (adaptado Vite) |
| `governance-gates.md` | verification, CI gates |
| `cursor-skills-mapping.md` | Índice completo Cursor → Claude |

**Como usar no Claude Code:** no prompt, diga:

> “Siga `docs/ai/skills/foundation-c-runtime.md` para esta tarefa.”

Ou use o comando `/read` (se disponível) nos arquivos listados.

---

## 9. MCP e integrações

| Integração | Cursor | Claude Code |
|------------|--------|-------------|
| Figma MCP | Plugin Cursor | Configure MCP no Claude Code separadamente |
| Prisma MCP | Plugin Cursor | Use CLI + `prisma-backend.md` |
| Supabase MCP | Plugin Cursor | Configure ou use `backend/.env` |
| GitHub PR | Cloud Agent | `gh pr create` manual ou integração Claude |

O repo **não** inclui config MCP — documente no seu `~/.claude/` ou settings do Claude Code.

---

## 10. Arquivos de handoff entre ferramentas

| Ferramenta | Arquivo principal |
|------------|-------------------|
| ChatGPT | `docs/evidence/PROJECT-COMPLETE-HANDOFF.md` (colar inteiro) |
| Claude Code | `CLAUDE.md` + este guia + skills |
| Cursor | `README_AI.md` + Skills automáticas + handoff |

Atualize handoff após cada slice mergeado.

---

## 11. Branch naming

```
cursor/<descriptive-name>-0b52
```

Exemplo atual: `cursor/foundation-c5-locator-permission-0b52`

---

## 12. Checklist sessão (copiar)

### Início
```
□ git pull origin main
□ Ler PROJECT-COMPLETE-HANDOFF.md
□ Ler skill relevante em docs/ai/skills/
□ npm run test:runtime (baseline verde)
```

### Fim
```
□ Testes + gates do slice PASS
□ CERTIFICATION-REPORT.md em docs/evidence/foundation-cN/
□ npm run lint
□ commit + push + PR
```

---

*Próximo: leia `docs/ai/skills/cursor-skills-mapping.md` para equivalências detalhadas.*
