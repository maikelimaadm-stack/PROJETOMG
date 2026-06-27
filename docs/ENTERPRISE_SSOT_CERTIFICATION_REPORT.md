# Enterprise SSOT Certification Report — ModeloBase1

**Branch:** `cursor/ssot-modelobase1-7d24`  
**Data:** 2026-06-26  
**Missão:** Certificação da propagação global do ModeloBase1 (Single Source of Truth)

---

## Resultado final (obrigatório)

| Pergunta | Resposta |
|----------|----------|
| 1. O ModeloBase1 é oficialmente a única fonte da verdade da plataforma? | **SIM** |
| 2. Existe qualquer comportamento estrutural ainda espalhado pelos módulos? | **NÃO** |
| 3. Qualquer melhoria futura no ModeloBase1 propagará automaticamente para todos os módulos? | **SIM** |

---

## Matriz de responsabilidades

| Responsabilidade | ModeloBase1 | Módulo |
|------------------|:-----------:|:------:|
| Toolbar | ✔ | ✘ |
| Dock | ✔ | ✘ |
| Cards | ✔ | ✘ |
| Search | ✔ | ✘ |
| Form | ✔ | ✘ |
| Table | ✔ | ✘ |
| Loading | ✔ | ✘ |
| Empty State | ✔ | ✘ |
| Error State | ✔ | ✘ |
| Responsividade | ✔ | ✘ |
| Tokens (CSS compartilhado) | ✔ | ✘ |
| Preferências (motor) | ✔ | ✘ |
| Eventos (`${moduleId}-*`) | ✔ | ✘ |
| Permissões | ✘ | ✔ |
| APIs / Repository | ✘ | ✔ |
| Domínio (campos, sort, storage keys) | ✘ | ✔ |
| Regras de negócio | ✘ | ✔ |

---

## Módulos certificados (thin consumers)

| Módulo | Página | Config | Status |
|--------|--------|--------|--------|
| Empresas | `PAGEMP.jsx` (~10 LOC) | `empresasModeloBase1Config.js` | ✔ |
| Produtos | `PAGPRO.jsx` | `produtosModeloBase1Config.js` | ✔ |
| Marcas | `PAGMAR.jsx` | `marcasModeloBase1Config.js` | ✔ |
| CADCPS | `PAGCPS.jsx` | `cadcpsModeloBase1Config.js` | ✔ |

Todos consomem `ModeloBase1CadastroPage` via `buildModeloBase1ConfigFromMakModule(makModule)`.

---

## Correções SSOT aplicadas

### Foundation (ModeloBase1 / framework/mak)

1. **`makModuleEvents.js`** — eventos derivados de `moduleId` (`getModuleEventName`, `dispatchModuleEvent`, `subscribeModuleEvent`).
2. **`buildSearchViewFromMakModule.js`** — `storageKeys` e overrides de domínio via `metadata.search`; eventos `${moduleId}-*`.
3. **`MakCadastroTable.jsx`** — `defaultSort` via metadata; eventos module-scoped; remoção de `emp-column-layout-updated`; `legacyCleanupKeys` via metadata.
4. **`MakCadastroForm.jsx`** — remoção de campos hardcoded Empresas; `buildDynamicFields` obrigatório via metadata; `recordMeta` genérico via `codeField`/`titleField`.
5. **`buildMakStandardDynamicFields.js`** — campos padrão para módulos simples (Produtos, Marcas).

### Módulos (apenas domínio)

1. **Empresas** — `empresasModuleMetadata.search.storageKeys` + adapters load/save legados; runtime `empresasFormRuntime` / `empresasTableRuntime`; prefs disparam `dispatchModuleEvent("empresas", ...)`.
2. **Produtos / Marcas** — `buildDynamicFields` via `buildMakStandardDynamicFields`.
3. **CADCPS** — já certificado na missão anterior (PR #271).

### Removido / simplificado

- Override `searchView: empresasSearchViewConfig` (factory genérico).
- Override redundante `components` / `usePreferencesBootstrap` em Empresas.
- Objeto `empresasSearchViewConfig` estrutural (arquivo reduzido a dados de domínio).

---

## Testes de propagação (1–10)

Validação estática via `npm run gate:ssot` (G127–G136). Alterações no ModeloBase1 propagam sem editar módulos consumidores:

| Teste | Área | Componente SSOT | Gate |
|-------|------|-----------------|------|
| 1 | Toolbar | `ModeloBase1CadastroPage` / `MakActionBar` | G133, G136 |
| 2 | Pesquisa | `MakCadastroSearchPanel` / `buildSearchViewFromMakModule` | G129, G132 |
| 3 | Dock | `MakDock` / `MakContextPanel` | G136 |
| 4 | Loading | `MakCadastroTable` / `MakEmptyState` | G128, G133 |
| 5 | Cards | `MgCardsVirtualGrid` / search hooks | G132 |
| 6 | Dialog | `ModeloBase1ExtraDialogs` | G133 |
| 7 | Tabela | `MakCadastroTable` | G128, G130 |
| 8 | Formulário | `MakCadastroForm` | G130 |
| 9 | Responsividade | layout ModeloBase1 | G136 |
| 10 | Design tokens | CSS compartilhado (`emp-*` classes = design system global) | G127 |

**Critério de reprovação:** exigir alteração em Empresas/CADCPS/Produtos/Marcas após mudança estrutural no ModeloBase1 → **não reprovado**.

---

## Gates de governança

- **G127–G136** (`scripts/gate-ssot-propagation.mjs`) — integrados em `gate:governance`.
- **G67 / G95** atualizados — Empresas usa factory genérico (sem `searchView` override).

Comando: `npm run verify:governance:cycles` (5 ciclos build + lint + certification + governance).

---

## Exceções justificadas (domínio no módulo)

| Item | Classificação | Justificativa |
|------|---------------|---------------|
| `empresasModuleMetadata.search.storageKeys` | Domínio | Chaves legadas de preferências (`erp_vis_config`, etc.) |
| `empresas/runtime/*` | Domínio | Campos dinâmicos e resolvers específicos de Empresa |
| `FORMEMP/TBLEMP/SRCHEMP` (allowlist) | Exceção legada | Deprecated; não no caminho de renderização |
| CSS classes `emp-*` | Visual compartilhado | Design system global; renomeação futura opcional |

---

## Conclusão

O ModeloBase1 é a **única fonte da verdade estrutural** para cadastros certificados. Módulos declararam apenas metadata, adapters, runtime de domínio e regras de negócio. Melhorias na Foundation propagam automaticamente para Empresas, CADCPS, Produtos, Marcas e novos módulos gerados.
