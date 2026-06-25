# Auditoria — Preferências Instantâneas (pré-correção)

**Data:** 2026-06-25  
**Base:** `main` pós PR #226  
**Objetivo:** mapear causa do atraso visual e pontos de correção mínima

---

## Causa raiz

1. **TBLEMP inicializava React state com defaults hardcoded** (`COLUNAS_BASE`) e só aplicava snapshot local em `useLayoutEffect` após `preferencesReady` + catálogo — primeiro paint ≠ preferência salva.
2. **Bootstrap remoto sobrescrevia localStorage** via `applyListagemPreferencesToStorage` com reason `listagem:hydrate`, disparando eventos que incrementavam `preferencesVersion` e re-hidrataram UI segundos depois.
3. **PUT de resposta re-hidratatava UI** via `hydrateListagemRecord` após save, causando flash mesmo quando local já estava correto.
4. **PAGEMP** iniciava `columnFilters`/`querySort` vazios e só hidratava no effect pós-bootstrap (`bootstrapGeneration`).
5. **Sem modelo `dirtySections`** — resposta remota/409 podia sobrescrever alteração local pendente.

---

## Tabela por preferência (pré-fix)

| Preferência | Estado React | Snapshot local | Chave local | Endpoint remoto | Seção backend | Evento hidratação | Pode resetar? |
| ----------- | ------------ | -------------- | ----------- | --------------- | ------------- | ----------------- | ------------- |
| Colunas visíveis/ordem | TBLEMP `colunasVisiveis/Ordem` | Sim | `emp_col_visiveis`, `emp_col_ordem` | PUT `empresas/listagem` | `table` | `listagem:hydrate`, cache subscribe | **Sim** — defaults → saved |
| Larguras | TBLEMP `columnWidths` | Sim | `emp_col_widths` | `table` | `table` | hydrate + version bump | **Sim** |
| Congelamento | TBLEMP `frozenColumnCount` | Sim | `emp_col_frozen` | `table` | `table` | hydrate | **Sim** |
| Sort | TBLEMP + PAGEMP `querySort` | Sim | `emp_col_sort` | `table` | `table` | PAGEMP bootstrap gen | **Sim** |
| Cards/linha | `useEmpCardsVisFields` | Sim | `erp_cards_layout_config` | `cards` | `cards` | cache `listagem:hydrate` | **Sim** |
| Campos cards | `useEmpCardsVisFields` | Sim | `erp_vis_config` | `cards` | `cards` | cache hydrate | **Sim** |
| Filtros rápidos | `useEmpFilterFieldsLayout` | Sim | `emp_filter_fields_layout_v1` | `filtersConfig` | `filtersConfig` | hydrate events | **Sim** |
| Operadores | TBLEMP / storage | Sim | `emp_filter_operators_v1` | `filtersConfig` | hydrate | Parcial |
| View mode | PAGEMP `viewMode` | Sim | `emp_view_mode_v1` | `view` (read-only sync) | bootstrap gen effect | **Sim** |
| Form layout | `useCadastroForm` | Sim | `cadastro:*:form_layout_config` | `form_layout` | FORM scope | `cadastro-layout-hydrated` | Skeleton delay |

---

## Correções aplicadas nesta PR

| Área | Mudança |
| ---- | ------- |
| `empresasPreferencesScopeState.js` | Modelo `dirtySections`, sync status, guard remoto |
| `empresasPreferencesStorage.js` | Apply remoto por seção; skip unchanged; skip dirty |
| `useEmpresasPreferencesBootstrap.js` | Remote apply conservador; PUT não re-hidrata UI |
| `TBLEMP.jsx` | Lazy init from snapshot; skip re-hydrate se `table` dirty |
| `PAGEMP.jsx` | Init sync columnFilters/querySort; skip re-apply se dirty |
| `useEmpCardsVisFields.js` | Skip hydrate remoto se `cards` dirty |
| `useEmpFilterFieldsLayout.js` | Skip hydrate remoto se `filtersConfig` dirty |
| `AuthContext.jsx` | Bind/reset scope state por usuário |

---

## Fluxo depois

```text
Abrir Empresas
→ ler snapshot scoped (sync, antes do paint)
→ renderizar com prefs locais
→ GET bootstrap em background
→ aplicar remoto SOMENTE se: seção não dirty AND diff real AND mais novo
→ PUT resposta: atualiza revision, limpa dirty, SEM re-hidratar UI
```
