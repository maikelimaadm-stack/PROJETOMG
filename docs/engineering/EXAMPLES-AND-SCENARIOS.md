# Examples and Scenarios — Program 3.8.6

**Date:** 2026-06-30  
**Scope:** Audit 11 — End-to-end flows from creation to execution  
**Note:** Flows marked **(Vision)** are architecturally defined but not fully operational in production.

---

## 1. Business Intent

### Scenario: Author wants calculated total field

**Path A — Vision (Business First):**
```
User: "Quero um campo Total que multiplica Preço por Quantidade"
  → Business Language parser
  → Business Intent { kind: "field.computed", expression: "preco * quantidade" }
  → Intent stored with lineage
```
**Evidence:** `businessLanguageToIntent` in gate tests; D-065 architecture.

**Path B — Actual (Expert Mode):**
```
User opens Formula Builder
  → Types "preco * quantidade" in expressionSource
  → buildBusinessComputedAsset() OR direct formula document
  → No Intent object in UX
```
**Evidence:** `FormulaEditor.jsx`, USER-JOURNEY-DEEP-AUDIT.

---

## 2. Business Capability

### Scenario: Platform certifies Computed Field readiness

```
Developer runs npm run gate:capabilities
  → G306 gate-business-computed-fields.mjs
  → 21 checks: contracts, derivation, projection, metadata facets
  → Pass → capability registered in GATE-REGISTRY
```
**Evidence:** `scripts/gate-business-computed-fields.mjs`.

**(Vision)** User-declarable capability "Aprovação de Pedidos" — not implemented; today capability = engineering gate only.

---

## 3. Business Asset — Computed Field (Full Flow)

```
1. CREATE
   Author → Formula Builder OR Intent
   buildBusinessComputedAsset({ label, expression, documentRef, ... })
   → Asset with 15+ metadata facets

2. VALIDATE
   businessComputedValidation.js
   G306 gate at CI

3. DERIVE (Resolver path)
   Intent → derivationPlanning → computedFieldDerivation
   → Same asset structure

4. PROJECT
   projectFormulaFromComputedField(asset)
   → { expression, ast, dependencies, runtimeHints }

5. EXECUTE (Vision)
   Runtime Bridge → CRB → Evaluation Engine → field value "Total"

6. EXECUTE (Actual empresas)
   PAG field config → MakCadastroForm → campoEngine.jsx
   → Value computed; Business Asset NOT in loop

7. AUDIT / LINEAGE
   businessComputedAuditTrail, businessComputedLineage (contracts)
   → No persistent store or UI yet

8. VERSION / PUBLISH (Vision)
   businessComputedVersioning → Marketplace publish
   → Metadata only
```

---

## 4. Business Object — Workflow (Vision — Program 3.9)

```
1. Author: "Quando pedido aprovado, mover para Faturamento"
2. Business Language → Intent { kind: "process.workflow" }
3. Resolver → Business Workflow Asset
   states: [Rascunho, Aprovado, Faturamento, Concluído]
   transitions: [{ from: Aprovado, to: Faturamento, trigger: "approve" }]
4. Projection → Runtime state machine config
5. Runtime: event "order.approved" → transition execute
6. Process Mining: log transition → discover bottleneck (future)
```

---

## 5. Business Computed Field vs Legacy Field

| Step | Business Asset path | Legacy path |
|------|---------------------|-------------|
| Define | Studio / Intent | PAG JSON |
| Store | Asset document (planned MDP) | Prisma + PAG file |
| Validate | G306 + contracts | Module validation |
| Execute | Projection → Runtime | campoEngine |
| Explain | businessComputedExplainability | None |

---

## 6. Business Dashboard (Vision)

```
1. Author selects KPIs: Total Vendas, Ticket Médio
2. Indicators derive from Computed Fields + aggregations
3. Dashboard Asset composes layout + data bindings
4. Runtime renders dashboard view
5. Business Health scores dashboard completeness
```

**Blockers:** Dashboard Asset, Indicator Asset, Runtime renderer.

---

## 7. Business Automation (Vision)

```
1. Trigger: "Quando estoque < mínimo"
2. Action: "Criar pedido de compra"
3. Automation Asset → Runtime event subscription
4. Backend event bus dispatches (TD-010 blocker)
5. Action executes via Integration Asset (future)
```

---

## 8. Business Report (Vision)

```
1. Report Asset defines template + data sources
2. Resolver binds to Document objects
3. Runtime generates PDF/Excel on schedule
4. Audit trail records generation
```

---

## 9. Business Integration (Vision)

```
1. Integration Asset: connector SAP, mapping rules
2. Marketplace installs package
3. Runtime sync job executes mapping
4. Business Memory learns sync patterns
```

---

## 10. Business AI (Vision)

```
1. User asks: "Por que minhas vendas caíram?"
2. Consulting Engine queries Business Memory + Knowledge Graph
3. Decision Engine proposes actions
4. User accepts → Intent → new Automation Asset
5. Evolution Engine tracks outcome
```

---

## 11. Business Process / Process Mining (Vision)

```
1. Workflow assets emit events: state.entered, transition.fired
2. Process Mining discovers: 40% time in "Approval"
3. Consulting Engine: "Enable parallel approval?"
4. User accepts → Workflow Asset v2
5. Business Health score improves
```

---

## 12. Business Memory (Vision)

```
1. Runtime logs: field edits, workflow transitions, user decisions
2. Memory ingests per tenant
3. Pattern: "Companies like yours use field X"
4. Feeds Consulting + Evolution
```

**Today:** Audit trail contract only; no ingestion.

---

## 13. Business DNA (Vision)

```
1. On tenant onboarding: industry=Retail, size=SMB
2. DNA profile selects template pack from Marketplace
3. Pre-configured Documents, Workflows, Dashboards installed
4. Knowledge Graph links industry benchmarks
```

---

## 14. Knowledge Graph (Vision)

```
Nodes: Computed Field "Total" → depends on → Field "Preço", Field "Quantidade"
       Workflow "Pedido" → contains → State "Aprovado"
Query: "What breaks if I remove field Preço?"
Answer: Lineage from businessComputedLineage + graph traversal
```

**Today:** Lineage contract on Computed Field; no graph store.

---

## 15. Decision Engine (Vision)

```
Input: Business rules + Memory patterns + current data
Output: Recommended decision with explanation
Example: "Approve credit limit increase — 92% similar cases approved"
```

---

## 16. Consulting Engine (Vision)

```
Proactive: "You have 3 duplicate campos across modules"
Reactive: User asks business question → cited recommendations
Explainability: Links to Memory evidence + Knowledge Graph paths
```

---

## 17. Evolution Engine (Vision)

```
Observes: Asset usage, Health scores, Memory patterns
Proposes: Deprecate unused field; upgrade formula; marketplace update
User approves → new asset version → Runtime sync
```

**Today:** `EvolutionMetadata.js` stub on Computed Field.

---

## 18. Business Health (Vision)

```
Scores: Configuration completeness, duplicate detection, workflow coverage
Dashboard for admin: "Your org is 67% EOS-ready"
Triggers Consulting when score drops
```

**Today:** ERI 3.8/10 is engineering metric in PLATFORM-MATURITY-INDEX.md.

---

## 19. Digital Organization (Vision)

```
Digital twin mirrors: org structure, processes, assets, KPIs
Simulation: "What if we add approval step?"
Feeds Evolution + Consulting
```

**Evidence:** D-066 architecture; 0% code.

---

## 20. Enterprise Operating System — Day in the Life

### Beginner user (Vision)
```
Login → Business shell (not ERP menu)
"Preciso controlar clientes" → Intent wizard
Platform derives Document + Fields + Workflow
User operates — never sees JSON/expressions
Consulting suggests improvements monthly
```

### Beginner user (Actual)
```
Login → Cadastro menu → Empresas
Fill form fields → Save
Custom calculated field: expert must use Formula Builder or PAG config
```

### Advanced user (Actual)
```
Studio → Layout / Field / Formula designers
Full expression editing
Gates validate on commit
```

### Administrator (Actual)
```
RBAC via cadastroRbac.js
MDP/CADCPS configuration
Module guard, tenant management via backend
No Digital Organization dashboard
```

### Enterprise @ 1000 users (Vision)
```
Event bus scales horizontally
Memory per tenant isolated
Marketplace packages deployed selectively
Business Health monitors org-wide
```

---

## 21. Scenario Summary Table

| Concept | Creation | Derivation | Execution | Status |
|---------|----------|------------|-----------|--------|
| Business Intent | Language/Studio | — | Resolver | Partial |
| Business Computed Field | Studio/Resolver | Resolver | campoEngine (legacy) | Partial |
| Business Workflow | Studio (Pl) | Resolver (Pl) | Runtime (Pl) | Planned 3.9 |
| Business Dashboard | Studio (Pl) | Resolver (Pl) | Runtime (Pl) | Planned |
| Business Memory | Runtime events | — | Intelligence (Pl) | 0% |
| Knowledge Graph | Asset lineage | — | Query (Pl) | 0% |
| Digital Organization | Onboarding (Pl) | DNA (Pl) | Twin (Pl) | 0% |

---

*All scenarios cite architecture docs and code paths verified 2026-06-30. See linked audit documents for evidence IDs.*
