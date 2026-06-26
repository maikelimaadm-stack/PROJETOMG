# CERTIFICAÇÃO ENTERPRISE — MAK Gestão ERP (Pré-Framework v1.0)

**Tipo:** Certificação técnica pré-transformação (Empresas → MAK Framework)  
**Escopo:** Frontend React/Vite, Backend Fastify/Prisma, PostgreSQL, ~72.400 LOC analisadas  
**Metodologia:** Análise estática de código, métricas, inventário arquitetural, projeção de escala  
**Data:** 25/06/2026  
**Resultado:** **PARCIALMENTE** pronto para base definitiva da MAK Framework  
**Nota geral:** **54 / 100**

---

## PARTE 1 — SAÚDE GERAL DO PROJETO

### 1.1 Visão consolidada

| Camada | Estado | Observação |
|--------|--------|------------|
| **Arquitetura** | Embrião de plataforma + monólito UI | `cadastro-engine` existe; Empresas concentra a Tela Mãe real |
| **Frontend** | Funcional e rico, difícil de escalar | 6 arquivos >800 linhas; prefs maduras; duplicação legado/MG |
| **Backend** | Enterprise-ready parcial | Fastify hardened, Prisma indexado, audit, cache, retry |
| **Banco** | Bem modelado para multi-tenant | FK, índices de listagem, JSONB onde faz sentido |
| **React/Vite** | Moderno (React 18, Vite 6, RQ 5) | StrictMode ativo; bundle CSS pesado |
| **Organização** | Boa intenção, execução bifurcada | `framework/`, `shared/`, `modules/empresas/` convivem com legado `Emp*` |

### 1.2 Separação de responsabilidades

**Pontos fortes:**

- Backend: routes → service → repository consistente
- APIs frontend isoladas em `src/apis/`
- React Query para server state
- Preferências com bootstrap, flush, cross-tab, conflict retry

**Pontos fracos:**

- `PAGEMP.jsx` (1.903 linhas) concentra orquestração, prefs, listagem, form, cards, export, anexos
- `TBLEMP.jsx` (2.459 linhas) concentra tabela + filtros + virtualização + prefs
- Framework UI em `modules/empresas/` em vez de `framework/mak/`
- `ErpShell` com branch exclusivo para Empresas
- Gerador de módulos ainda aponta para `EmpListToolbar` (legado), não `MgActionBar`

### 1.3 Nota — Saúde Geral: **58 / 100**

Base sólida para ERP multi-tenant, mas **não certificada como plataforma** até extração da Tela Mãe e eliminação de bifurcações arquiteturais.

---

## PARTE 2 — QUALIDADE DO CÓDIGO

### 2.1 Duplicação identificada

| Categoria | Ocorrências | Impacto |
|-----------|-------------|---------|
| **Toolbar** | MgActionBar vs EmpListToolbar/EmpRecordToolbar | 2 UX + 2 codepaths |
| **Tabela** | TBLEMP (2.459) vs TBLCPS (1.050) | ~55% lógica repetida |
| **Página cadastro** | PAGEMP vs PAGCPS vs PAGTemplate | 3 orchestrators |
| **Confirmação** | ConfirmDialog + ErpConfirmProvider | Dupla API |
| **Design system** | Emp* / Cad* / Mg* | 3 famílias |
| **CSS** | 20.811 linhas; overlap `--mg-*` / `--erp-*` | ~30–40% overlap |
| **Filtros** | `buildEmpresaListFilters.js` hardcoded | Por módulo duplicado |
| **Switch** | shadcn + ToggleSwitch + mak-switch | 3 implementações |

### 2.2 Código morto / obsoleto

| Item | Local | Evidência |
|------|-------|-----------|
| `EmpColFilterPopover.jsx` | empresas/components | `@deprecated` |
| `PAGCampos.jsx` | modules/campos | Re-export PAGCPS; sem rota |
| EmpListToolbar no gerador | template/scaffold | Obsoleto vs MgActionBar |
| shadcn não usados | shared/ui | ~12 componentes |
| recharts + chart.jsx | package.json | Zero uso |
| Histórico ActionBar | MgActionBar L263–268 | `onClick: () => {}` |

### 2.3 Acoplamentos críticos

- `EmpresasPreferencesBootstrapProvider` no `App.jsx` — global a um módulo
- `MgEmpresasChromeProvider` no `ErpShell` — só rota Empresas
- `LayoutPreferencesEngine` → `empresasPreferencesCache` — circular framework↔módulo

### 2.4 Métricas

| Métrica | Valor |
|---------|-------|
| Arquivos JS/JSX frontend | ~340 |
| Arquivos >800 linhas | 6 (~9.400 linhas) |
| useMemo / useCallback | ~193 / ~190 |
| React.memo | **2** (subutilizado) |

---

## PARTE 3 — PERFORMANCE

### Notas por dimensão

| Dimensão | Nota |
|----------|------|
| Renderização | 62 |
| Memoização | 45 |
| Virtualização | 78 |
| React Query | 72 |
| Bundle JS | 55 (796 KB chunk principal) |
| Bundle CSS | 40 (634 KB) |
| Lazy loading | 70 |
| StrictMode | 75 |

**Nota Performance geral: 61 / 100**

**Destaques:** infinite scroll, indexes Prisma, LIST_SELECT enxuto, transactionRetry, prefetch prefs, performance marks.

**Riscos Framework:** CSS monolítico; monólitos PAGEMP/TBLEMP; pouco React.memo em grids pesados.

---

## PARTE 4 — UX ENTERPRISE

**Nota UX: 74 / 100**

Empresas/MG acima da média; outros módulos inconsistentes.

**Gaps:** Histórico/Impressão placeholder; skeleton subutilizado; dual shell; confirmação dupla API.

---

## PARTE 5 — DESIGN SYSTEM

**Nota: 52 / 100**

MG forte mas fragmentado (Emp/Cad/Mg/Erp + shadcn). recharts morto. Tokens duplicados.

---

## PARTE 6 — FRONTEND

**Nota: 56 / 100**

Monólitos: TBLEMP (2.459), EmpLayoutConfiguratorDialog (2.109), PAGEMP (1.903), FORMEMP (1.183).

Acoplamento: App, ErpShell, LayoutPreferencesEngine, AuthContext → empresas prefs.

---

## PARTE 7 — BACKEND

**Nota: 71 / 100**

Fastify hardened, Prisma, audit, cache, multi-tenant. Gaps: RBAC granular, event bus, Zod v3/v4 split.

---

## PARTE 8 — BANCO DE DADOS

**Nota: 76 / 100**

Multi-tenant, indexes listagem, AuditLog. Gaps: soft delete, AuditLog particionamento em escala extrema.

---

## PARTE 9 — SEGURANÇA

**Nota: 68 / 100**

JWT, rate-limit, Helmet, accessScope. Gaps: RBAC UI, CSP off, CSRF parcial.

---

## PARTE 10 — RESPONSIVIDADE

**Nota: 70 / 100**

Mobile MG completo; tablet/4K/zoom parcial.

---

## PARTE 11 — ACESSIBILIDADE

**Nota: 48 / 100**

ARIA parcial; tabela virtual desafiadora; WCAG não auditado formalmente.

---

## PARTE 12 — ESCALABILIDADE

| Cenário | Hoje | Pós-Framework |
|---------|------|---------------|
| 5.000 módulos UI | ❌ | ✅ |
| 1.000 devs | ❌ | ✅ |
| 500M registros | ⚠️ | ⚠️ |

**Nota hoje: 42 / 100** → **pós-extração: ~78 / 100**

---

## PARTE 13 — DÍVIDA TÉCNICA

### 🔴 Crítico

1. UI framework em `modules/empresas/`
2. Monólitos PAGEMP/TBLEMP
3. Prefs globais acopladas a Empresas
4. ErpShell branch empresas
5. CSS 634KB monolítico
6. RBAC ausente frontend
7. Gerador → toolbar legada

### 🟠 Alto

8–15: Duplicação TBLCPS, LayoutPreferencesEngine cache, confirm dual, dead deps, Zod split, History UI, empty states, React.memo.

### 🟡 Médio / 🟢 Baixo

16–25: Nomenclatura, index.css god file, CSP, soft delete, deprecated files.

---

## PARTE 14 — LIMPEZA

Removível: PAGCampos, EmpColFilterPopover, chart/carousel/recharts, ~12 shadcn mortos, CSS comentado, placeholders History/Print.

---

## PARTE 15 — PROBLEMAS REPLICADOS NA FRAMEWORK

25 itens documentados — ver checklist abaixo. Principais: keys `emp_*`, provider global, ErpShell imports, monólitos, filters hardcoded, dual toolbar, RBAC zero.

---

## PARTE 16 — ROADMAP

| Fase | Foco |
|------|------|
| **1** | Prefs genérico, desacoplar ErpShell/LayoutEngine, CI gates, Zod |
| **2** | `framework/mak/`, unificar toolbar, catalogs, gerador |
| **3** | UX: History, empty states, shell unificado |
| **4** | Performance: CSS split, memo, bundle |
| **5** | Limpeza |
| **6** | Padronização Mak DS + RBAC |
| **7** | MakCadastroPage + ModuleConfig + contract tests |

---

## PARTE 17 — CERTIFICAÇÃO FINAL

| Dimensão | Nota |
|----------|------|
| Arquitetura | 58 |
| Código | 54 |
| Frontend | 56 |
| Backend | 71 |
| Banco | 76 |
| Performance | 61 |
| UX | 74 |
| Design System | 52 |
| Responsividade | 70 |
| Segurança | 68 |
| Escalabilidade (hoje) | 42 |
| Manutenibilidade | 45 |
| Reutilização | 50 |
| Padronização | 48 |
| Preparação Framework | 55 |
| MAK Studio | 28 |
| IA | 30 |
| Marketplace | 22 |
| Plugins | 25 |
| 10 anos | 40 |

**Nota geral: 54 / 100**

---

## RESULTADO FINAL

> **"Hoje, o MAK está pronto para se tornar a base definitiva da MAK Framework?"**

### **PARCIALMENTE**

Pronto para **iniciar** a transformação com roadmap disciplinado. Não certificado como base **definitiva** hoje.

**Condição certificação plena:** Fases 1–2 do roadmap + gates CI prefs/perf + extração para `framework/mak/`.

---

## CHECKLIST DE CORREÇÕES

### Bloqueantes (Framework v1)

- [ ] Criar `framework/mak/` e mover componentes Mg*
- [ ] Extrair `MakCadastroPage` de PAGEMP
- [ ] Extrair `MakTable` de TBLEMP
- [ ] Extrair `MakFormShell` de FORMEMP
- [ ] Generalizar preferences (remover prefixo emp global)
- [ ] `MakPreferencesBootstrapProvider` no App
- [ ] Desacoplar ErpShell de imports empresas
- [ ] Desacoplar LayoutPreferencesEngine de empresasPreferencesCache
- [ ] Parametrizar columnCatalog, filterCatalog, cardCatalog
- [ ] Deprecar EmpListToolbar/EmpRecordToolbar
- [ ] Atualizar gerador para padrão MG/Mak
- [ ] Alinhar Zod v3→v4 frontend

### Qualidade / Performance

- [ ] Split CSS (<300KB gzip)
- [ ] Remover recharts, embla, shadcn mortos
- [ ] React.memo em MakTable, MakCardsVirtualGrid, MakActionBar
- [ ] Bundle analysis no CI
- [ ] Padronizar skeleton vs spinner

### UX / Design System

- [ ] MasterHistory ou remover placeholder
- [ ] Empty states catalogados
- [ ] Shell sidebar MG global
- [ ] Tokens `--mak-*`
- [ ] Documentar Mak Design System

### Segurança / Enterprise

- [ ] RBAC frontend + backend ACL
- [ ] CSP gradual
- [ ] Audit UI
- [ ] Soft delete strategy

### Escalabilidade

- [ ] Event bus mak/events
- [ ] AuditLog particionamento
- [ ] Contract tests ModuleConfig
- [ ] Storybook Mak
- [ ] A11y WCAG 2.1 AA

### Limpeza

- [ ] Remover PAGCampos, EmpColFilterPopover
- [ ] API única ErpConfirm
- [ ] Placeholders onClick vazios
- [ ] CSS comentado index.css

---

## Documentos relacionados

- [PERFORMANCE_ENTERPRISE_REPORT.md](./PERFORMANCE_ENTERPRISE_REPORT.md)
- [EMPRESAS_PREFERENCES_FORENSIC_REPORT.md](./EMPRESAS_PREFERENCES_FORENSIC_REPORT.md)
- [INSTANT_PREFERENCES_AUDIT.md](./INSTANT_PREFERENCES_AUDIT.md)
- [AUDITORIA_BANCO_DADOS.md](./AUDITORIA_BANCO_DADOS.md)
- [ARQUITETURA.md](../../ARQUITETURA.md)
