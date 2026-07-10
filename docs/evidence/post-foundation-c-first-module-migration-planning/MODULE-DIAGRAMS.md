# Post-Foundation C — Module Diagrams

**Slice:** Post-Foundation C — First Real Module Migration Planning

---

## 1. Estado atual e camada de planejamento

```mermaid
flowchart TD
  LegacyUI["Empresas Legacy UI"] --> Legacy["Runtime Legado (fonte da verdade)"]
  Shadow["Empresas Shadow Pipeline"] --> V2["Runtime v2 (observação)"]
  Route["Runtime v2 Dev Preview Route"] --> Hub["Preview Hub"]
  Hub --> Dataset["Controlled Dataset"]

  Planning["Migration Planning (este slice)"] --> Readiness["Readiness Model"]
  Planning --> Risk["Risk Model"]
  Planning --> Rollback["Rollback Plan"]
  Planning --> Next["Next Slice Recommendation<br/>(read-only candidate)"]

  Legacy -. observado por .-> Readiness
  V2 -. sinais de shadow .-> Readiness
  Hub -. sinais de preview .-> Readiness
  Dataset -. sinais de dataset .-> Readiness
  Route -. sinais de rota .-> Readiness
```

## 2. Escada de readiness (capada em read_only_candidate)

```mermaid
flowchart LR
  A["not_ready"] --> B["shadow_ready"]
  B --> C["preview_ready"]
  C --> D["read_only_candidate<br/>(máximo deste slice)"]
  D -. próximos slices .-> E["migration_candidate"]
  E -. futuro .-> F["(cutover)"]
  X["blocker presente"] --> Z["blocked"]
```

## 3. Fases da migração de Empresas (nenhuma executada neste slice)

```mermaid
flowchart TD
  P0["Fase 0 — Current State<br/>legado controla, v2 observa"] --> P1["Fase 1 — Read-only v2 Candidate<br/>(próximo slice provável)"]
  P1 --> P2["Fase 2 — Dual Read / Shadow Compare"]
  P2 --> P3["Fase 3 — Guarded UI Slice"]
  P3 --> P4["Fase 4 — Controlled Write Candidate<br/>(fora de escopo)"]
  P4 --> P5["Fase 5 — Full Cutover Candidate<br/>(fora de escopo)"]

  style P4 stroke-dasharray: 5 5
  style P5 stroke-dasharray: 5 5
```

## 4. Rollback (flag off — reversão trivial por design)

```mermaid
flowchart LR
  Trigger["critério de rollback<br/>(divergência/permissão/validação/visual/perf/gate)"] --> Flag["feature flag OFF"]
  Flag --> LegacyBack["render legado restaurado"]
  Flag --> NoSchema["sem schema change"]
  Flag --> NoWrite["sem write real"]
  Flag --> Revert["reversão por PR"]
  LegacyBack --> Validate["re-rodar gates + test:runtime + lint + build"]
```
