# Real Module Readiness

## Peças já prontas para um módulo real

- **Session** local (dispatch/getState/reset) — o ciclo de rascunho operacional.
- **State machine** (idle→draft→dirty→valid/invalid→saved_local→submitted_simulated→reset).
- **Command resolver + payload validation** (fail-closed).
- **Event log** append-only determinístico com checksum.
- **Read state** derivado (entries/summary/timeline + table/form compat).
- **Snapshot bridge** (create/validate/restore/roundtrip in-memory).
- **Diagnostics + fallback/rollback**.
- **Conformance** operacional contra o Generic Model Runtime (score 1.00).

## Peças que ainda faltam (fora deste slice)

- **UI real** (formulário de lançamento, lista de entries, timeline) — nenhuma neste slice.
- **Rota/menu** — nenhum.
- **Persistência real** (backend/Prisma) — intencionalmente ausente (`persistenceReal:false`).
- **Envio/replicação** (`sent` sempre false) — offline-first/sync é futuro.
- **Transações reais** — o event log é append local, sem transação.
- **Permissões/auth** por módulo — fora de escopo.

## Como combustível poderia usar

- `moduleId: 'combustivel'`; entries = lançamentos de abastecimento (litros, veículo, data).
- Ciclo: createDraft → appendEntry (por abastecimento) → validateDraft → saveDraft → submitDraft
  (simulado) → snapshot para revisão.
- Um passo futuro liga a UI e, só então (com auditoria), a persistência real.

## Como pesagem poderia usar

- `moduleId: 'pesagem'`; entries = pesagens (bruto/tara/líquido, ticket).
- Mesmo ciclo local; timeline de eventos serve de trilha de apontamento.

## Riscos de ir para módulo real agora

- Pular para backend sem um **candidate audit** dedicado.
- UI real acoplar cedo demais ao shape ainda simplificado.
- Confundir esta fundação headless com um módulo produtivo.
- Event log simplificado não cobrir transações/concorrência reais.

## Recomendação do próximo slice

**ModeloBase2 First Real Module Candidate Audit** (auditar um módulo candidato — ex.: combustível —
contra esta fundação, ainda headless) **ou** **Fuel/Pesagem Headless Candidate**. **Não** backend
write ainda.
