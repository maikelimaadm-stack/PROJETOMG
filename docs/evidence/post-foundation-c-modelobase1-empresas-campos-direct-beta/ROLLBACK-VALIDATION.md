# ROLLBACK VALIDATION — ModeloBase1 Direct Beta

## Reversibilidade

O slice é reversível por **dois** mecanismos independentes, ambos sem efeito destrutivo:

### 1. Reversão por flag (runtime, sem deploy)

Desligar `MAK_MODELOBASE1_EMPRESAS_BETA`, `MAK_MODELOBASE1_CADCPS_BETA` e `MAK_MODELOBASE1_DIRECT_BETA` (padrão já é off) → nenhum read model é injetado → ModeloBase1 renderiza o config legado. Nenhuma migração de dados, nenhum schema, nenhum estado persistido para reverter.

### 2. Reversão por revert do PR (código)

`git revert` do commit remove: o módulo `src/runtime/modelobase1-direct-beta/`, o ponto de injeção, o wiring nas duas configs, os exports do barrel, o modo de escopo do guard e os scripts. Como o slot só é anexado quando presente e nada no engine o consome (Fase 1 passiva), o revert é limpo e não deixa referências órfãs.

## Sem estado destrutivo

- **Sem escrita:** read-only; write guard bloqueia 11 operações. Nenhum dado é criado/alterado/apagado.
- **Sem backend/Prisma/schema:** nenhuma migração; nada a reverter no banco.
- **Sem storage:** nenhum `localStorage`/`sessionStorage`/`IndexedDB`.
- **Sem dados reais:** fonte = controlled dev dataset (mock).

## Matriz de rollback

| Ação | Como | Efeito | Destrutivo? |
|---|---|---|---|
| Desligar beta | flags off | fallback legado imediato | Não |
| Fail-closed prod | (automático) | fallback legado em produção | Não |
| Revert do PR | `git revert` | remove todo o slice | Não |

## Verificação automatizada

- `gate:g423-modelobase1-direct-beta` check 8/9/10: off → fallback; injection point no-op; builder anexa só quando presente.
- Regressão completa (todos os gates anteriores + master `gate:g423` + `test:runtime` + lint + build) confirma que, com as flags off (estado de CI), o comportamento é idêntico ao pré-slice.

## Conclusão

**Rollback validado.** Reversível por flag (sem deploy) e por revert (código), sem qualquer efeito destrutivo, sem persistência a desfazer.
