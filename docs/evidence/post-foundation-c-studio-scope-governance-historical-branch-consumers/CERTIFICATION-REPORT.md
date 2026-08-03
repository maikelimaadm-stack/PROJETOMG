# Certification Report — Studio Scope Governance Historical Branch Consumers (fatia 44)

## Objetivo

Desbloquear, com segurança, a atualização futura de uma branch histórica aberta (a PR #495,
fatia 41) sem enfraquecer o núcleo de certificação de escopo. O bloqueio é real e foi
reproduzido: consumidores branch-relative de fatias **posteriores** (42, 43, 44) reprovam
qualquer branch cuja fatia ativa seja **anterior** a eles, com `active_slice_before_caller`.

Ver `ROOT-CAUSE.md` para o diagnóstico completo, medido na `main` em `fd2c38a0`.

## A separação

Duas perguntas distintas, até aqui confundidas numa só chamada:

| pergunta | API | resposta em branch antiga com caller posterior |
|---|---|---|
| **esta branch está certificada?** | `evaluateStudioBranchScope` / `evaluateStudioBranchDiffScope` | `safe: false`, `active_slice_before_caller` — **inalterado** |
| **este consumidor se aplica a esta branch?** | `evaluateStudioBranchConsumerScope` (nova) | `notApplicable: true`, `safe: true`, **após recertificar contra a fatia dona** |

A fronteira nova nunca declara inaplicabilidade sem antes rodar
`evaluateStudioBranchScope(changedPaths, { callerSliceId: activeSlice.sliceId })`. Se essa
recertificação reprovar, o resultado é `active_slice_scope_invalid` com `safe: false` — não
inaplicabilidade. Contrato completo em `CONSUMER-APPLICABILITY-CONTRACT.md`.

## O que NÃO mudou

`CORE-NON-REGRESSION.md` registra o invariante. Verificado ao vivo:

- `resolveActiveStudioSlice([])` → `ok: false`, `no_active_slice_resolved`;
- `evaluateStudioBranchScope([], …)` → `safe: false`;
- `evaluateStudioBranchDiffScope(FIXTURE_41, { caller: 42/43/44 })` → `safe: false`,
  `active_slice_before_caller`;
- nenhuma opção permissiva introduzida (`allowHistorical`, `ignoreChronology`, `skipChronology`,
  `permissive`, `bypassChronology` ausentes do guard);
- nenhuma maquinaria de emenda reintroduzida (`electedBy`, `amendedBy`, `amendsSliceIds`,
  `activeMarkerAmendmentPatterns`, `amendedCandidates` ausentes);
- `resolveActiveStudioSlice` continua estrita: zero marcadores e dois-ou-mais marcadores são
  ambos recusas; ordinal, `status` e autorização cruzada não desempatam;
- `createResolvedActiveStudioSlicePathAuthorizer` continua a fonte única de isenção histórica;
- guard importa só o registry; registry não importa nada; zero `execSync`, `child_process`,
  `fetch(`, `process.env`, `Date.now`, `PrismaClient`, `readFileSync` em ambos.

## Escopo entregue

- **Registry**: fatia 44 registrada; fatia 43 → `merged`; catálogo com 44 entradas, ordinais
  contíguos 1..44, exatamente uma `active_slice`; novo export
  `HISTORICAL_BRANCH_CONSUMERS_SLICE_ID`. A entrada da fatia 41 (Builder) permanece intacta:
  ordinal 41, `open_pull_request_495`, 4 primary, 2 cross, 0 forbidden explícito.
- **Guard**: `evaluateStudioBranchConsumerScope` — aditiva, congelada, determinística,
  sem efeito colateral.
- **36 consumidores migrados**: 9 testes agregados, 22 gates Studio, 5 consumidores de
  governança que julgam diff de branch. Detalhes em `NINE-TEST-CONSUMER-MIGRATION.md`,
  `TWENTY-TWO-GATE-CONSUMER-MIGRATION.md` e `GOVERNANCE-CONSUMER-MIGRATION.md`.
- **Fatia própria**: teste + gate + 13 documentos de evidência + wiring em `package.json`.

Inventário exato em `SCOPE-INVENTORY.md`. Diff da branch: 54 caminhos, um único marcador,
nenhum `forbidden`, nenhum `unknown`, nenhum `chronologicalViolation`.

## Resultados medidos

| item | resultado |
|---|---|
| `test:runtime:studio-scope-governance-historical-branch-consumers` | **289/289 PASS**, 0 fail |
| `gate:g423-studio-scope-governance-historical-branch-consumers` | **408/408 PASS**, exit 0 |
| `test:runtime:studio-scope-governance-maintenance` | 74/74 PASS |
| `gate:g423-studio-scope-governance-maintenance` | 34/34 PASS |
| `test:runtime:studio-scope-governance-chronological-migration` | 807/807 PASS |
| `gate:g423-studio-scope-governance-chronological-migration` | 722/722 PASS |
| `test:runtime:studio-scope-governance-main-diff-correction` | 472/472 PASS |
| `gate:g423-studio-scope-governance-main-diff-correction` | 453/453 PASS |
| 9 testes agregados migrados | 627 · 665 · 827 · 412 · 433 · 482 · 557 · 518 · 684 — **0 fail** |
| 22 gates Studio migrados | todos exit 0 — 32 · 74 · 88 · 86 · 90 · 97 · 106 · 106 · 118 · 127 · 125 · 133 · 151 · 136 · 148 · 164 · 167 · 206 · 229 · 199 · 242 · 241 |

O gate desta fatia julga a própria branch ao vivo (54 caminhos, nunca um diff vazio como prova)
e a declara sã para o próprio caller, para os nove callers agregados e para os três callers de
governança.

## Bateria agregada

```
npm run test:runtime   → 21207 tests, 21207 pass, 0 fail
npm run gate:g423      → 7/7 PASS
npm run lint           → exit 0
npm run build          → exit 0
dist/                  → nenhum artefato de governança exposto
```

Varredura completa `g423-*.mjs`: 109 arquivos, 97 exit 0, 12 exit != 0. Os 12 são exatamente
gates de `LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED`, byte-idênticos a `origin/main`,
reprovando apenas nas próprias allowlists de escopo de branch pré-centrais. Detalhe e prova em
`READINESS.md`. Condição aberta, pré-existente, não corrigida e não mascarada.

## Matriz negativa

`NEGATIVE-MATRIX.md` registra, item a item, o que continua reprovando: entrada inválida nunca
vira vazio; caller desconhecido nunca vira inaplicável; fatia ativa irresolvível ou ambígua
nunca vira inaplicável; consumidor posterior nunca mascara caminho proibido, desconhecido,
estrangeiro ou segundo marcador; os oito sósias continuam sem dono; artefatos reais de migração
de banco continuam proibidos.

## PR #495

Não tocada. Sem checkout, sem merge, sem rebase, sem alteração de body, sem alteração de
arquivo. Prova em `PR495-NO-TOUCH-PROOF.md` (head remoto `9634c364`, ausente de todos os 54 caminhos do diff). O exercício foi feito por fixture determinística em memória, declarada como
tal em `PR495-HISTORICAL-BRANCH-FIXTURE.md`.

## Limites declarados

- A `main` **não** foi verificada: ela ainda não contém esta fatia. `mainVerifiedGreen: false`.
- `READY_TO_UPDATE_PR495_WITH_MAIN` **não** é declarado aqui. `readyToUpdatePr495WithMain: false`.
  A condição está em `READINESS.md` e o procedimento em `POST-MERGE-REVALIDATION-PLAN.md`.
- Os 21 gates pré-Studio de `LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED` continuam **não
  migrados**, não PASS e não mascarados.
- A fixture da #495 é representativa, não o diff real daquela branch — que só pode ser medido
  quando ela for atualizada, o que esta fatia não faz e não autoriza.
- Evidência histórica mergeada permanece imutável: nenhum documento de fatia anterior foi
  editado nesta branch.
