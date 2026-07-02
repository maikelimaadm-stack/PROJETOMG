# MAK Business Language Architecture

**Status:** Official — Permanent architecture reference  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 3.6.8 — Business Language Architecture  
**Decision:** D-065  
**Layer:** L5 (Experience Authoring) + L6 (Knowledge / Vocabulary services) — **business language SSOT**  
**Hierarchy:** Constitution → Master Architecture → … → **This document** → …

> **MMM supersession (D-MMM-08, D-MMM-15):** SSOT = [docs/meta-model/20-BUSINESS-LANGUAGE.md](../meta-model/20-BUSINESS-LANGUAGE.md). This document is **Reference (pre-MMM)**.

---

## ⚠️ Scope boundary (Program 3.6.8)

| In scope | Out of scope (this mission) |
|----------|----------------------------|
| Permanent **Business Language** layer — all concepts in §3 | Code, APIs, database, runtime, Foundation, Studio changes |
| How users express business needs without technical exposure | Intent Resolver **implementation** (Program 3.7) |
| Authoring modes, vocabulary, grammar, validation, AI assist **policies** | NLP engines, LLM integration code |
| Official birth of Business Intent from business language | Business Computed Fields, Workflow UI |
| Architecture freeze declaration (§12) | Any new architecture program before 3.7 impl |

**Rule:** The user **never** works with Formulas, AST, JSON, Code, SQL, Engines, or Runtime. The user works exclusively with **Objectives, Rules, Processes, Events, Conditions, and Expected Results**. Business Language transforms these into **Business Intent**. After acceptance of this architecture (**D-065**), **no new architecture documentation** shall be created before **Program 3.7 — Business Intent Resolver Implementation** (G304).

**Distinction from related SSOTs:**

| Document | Scope |
|----------|-------|
| [MAK-PLATFORM-LANGUAGE-STANDARD.md](./MAK-PLATFORM-LANGUAGE-STANDARD.md) (D-015) | Platform/technical nomenclature for docs, APIs, identifiers |
| **This document** (D-065) | Tenant **business-user** language for authoring any platform asset |
| [MAK-KNOWLEDGE-ARCHITECTURE.md](./MAK-KNOWLEDGE-ARCHITECTURE.md) (D-057) | Enterprise Vocabulary storage and Knowledge graph |
| [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) (D-059) | Intent Document, Catalog, lifecycle — **consumer** of Business Language output |

---

## 1. Purpose

**Business Language** is the official platform layer that defines **how any business user creates any platform asset using exclusively business language** — without ever touching technical implementation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BUSINESS USER                                                               │
│  Objectives · Rules · Processes · Events · Conditions · Expected Results   │
├─────────────────────────────────────────────────────────────────────────────┤
│  BUSINESS LANGUAGE ◄── THIS DOCUMENT (Program 3.6.8)                         │
│  Vocabulary · Grammar · Wizards · Conversation · Confirmation · Validation   │
├─────────────────────────────────────────────────────────────────────────────┤
│  BUSINESS INTENT (D-059)                                                     │
│  Business Intent Document — SSOT of declared intention                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  INTENT RESOLVER (D-064) → DERIVATION (D-063) → STUDIO → MDP → RUNTIME      │
│  Never visible to business user                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mandatory business language principles (Program 3.6.8)

| # | Principle | Rule |
|---|-----------|------|
| **BL-1** | Business language only | User never authors Formulas, Workflows, AST, JSON, code, SQL |
| **BL-2** | Intent as output | Business Language always converges on Business Intent Document |
| **BL-3** | No technical exposure | User never sees Engines, Runtime, Resolver, Derivation internals |
| **BL-4** | Structured expression | Objectives, Rules, Processes, Events, Conditions, Results — not free-form code |
| **BL-5** | Vocabulary governance | Terms resolve via Business Dictionary / Enterprise Vocabulary |
| **BL-6** | Ambiguity resolution | Platform blocks or clarifies ambiguous statements before Intent creation |
| **BL-7** | Explicit confirmation | User confirms Intent before Resolver invocation |
| **BL-8** | Explainability | Platform explains decisions in business language |
| **BL-9** | AI assists — never replaces | AI accelerates authoring; user approves; AI never creates technical artifacts |
| **BL-10** | Platform without AI | Full authoring path without AI |
| **BL-11** | Technology Transparency | All technical complexity invisible ([Platform Vision](../vision/MAK-2035-PLATFORM-VISION.md)) |
| **BL-12** | Marketplace shares language | Marketplace publishes Templates, Vocabulary packs, Intent patterns — not implementations |
| **BL-13** | Versioned & evolvable | Business Language artifacts versioned per tenant |
| **BL-14** | Localizable | Business terms and UI copy localizable per tenant/locale |
| **BL-15** | Resolver exclusivity downstream | Business Language produces Intent only — Resolver derives all else (D-064) |

---

## 3. Permanent architectural concepts

### 3.1 Business Language

The **platform layer and experience contract** by which business users express enterprise needs. Not a programming language — a **governed business expression system** combining vocabulary, grammar, authoring surfaces, and validation that outputs Business Intent Documents.

| Attribute | Value |
|-----------|-------|
| Contract version | `mak-business-language-v1` |
| Owner layer | L5 Experience Authoring |
| Output artifact | `BusinessIntentDocument` (D-059) |
| Consumers | Intent Authoring, Resolver (indirect), Marketplace, Knowledge |

### 3.2 Business Vocabulary

Tenant-scoped **canonical term set** for business expression. Subset surfaced to users; full graph may live in [Enterprise Vocabulary](./MAK-KNOWLEDGE-ARCHITECTURE.md).

| Field | Purpose |
|-------|---------|
| `termId` | Stable identifier |
| `label` | User-facing term |
| `definition` | Business definition |
| `domain` | Category / module scope |
| `status` | `draft` \| `approved` \| `deprecated` |

**Version constant:** `mak-business-vocabulary-v1`

### 3.3 Business Grammar

**Rules of valid business expression** — what sentence structures, operand order, and constraint patterns are allowed when composing Intent content.

| Rule class | Example |
|------------|---------|
| Sentence pattern | `[When] [Condition] [Then] [Expected Result]` |
| Operand binding | Business Object + field labels only |
| Prohibited | Code tokens, function names, SQL keywords |
| Category rules | Computation intents require measurable outcome phrase |

**Version constant:** `mak-business-grammar-v1`

### 3.4 Business Terms

Atomic **named concepts** in the tenant dictionary — the building blocks of Business Sentences.

| Attribute | Description |
|-----------|-------------|
| `termId` | Unique within tenant |
| `type` | `entity` \| `field` \| `metric` \| `action` \| `event` \| `role` |
| `bindings` | Links to Business Object / Capability (internal — not shown as IDs to user) |

### 3.5 Business Dictionary

The **authoritative catalog** of Business Terms for a tenant — curated, approved, searchable.

| Content | Rule |
|---------|------|
| Approved terms | Only approved terms in production authoring |
| Draft terms | Visible to stewards; flagged in authoring |
| Import | Marketplace vocabulary packs merge via review |

**Version constant:** `mak-business-dictionary-v1`

### 3.6 Business Synonyms

Alternate **business phrases** mapping to canonical Business Terms — enables natural variation without ambiguity.

| Field | Purpose |
|-------|---------|
| `synonymPhrase` | User-typed or spoken variant |
| `canonicalTermId` | Resolved term |
| `locale` | Optional locale scope |
| `confidence` | Match strength (for assisted authoring) |

**Rule:** Synonym resolution runs **before** Intent Validation; unresolved synonyms trigger clarification (§3.13).

### 3.7 Business Templates

Reusable **Intent patterns** expressed in business language — "Commission on sales", "Approval when amount exceeds limit".

| Template field | Description |
|----------------|-------------|
| `templateId` | Stable id |
| `intentPhrasePattern` | Parameterized business sentence |
| `parameters` | Business-named slots user fills |
| `category` | Business Category (§3.12) |

Templates produce Intent Documents via [Intent Authoring](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) — Business Language defines the **language surface** of templates.

### 3.8 Business Sentences

A **single structured business statement** — the primary unit of user expression before aggregation into Intent Document.

```typescript
// Conceptual — not implementation code
BusinessSentence {
  schemaVersion: "mak-business-sentence-v1"
  id: string
  pattern: string                    // grammar pattern id
  phrase: string                     // user-visible business text
  terms: BusinessTermRef[]           // resolved canonical terms
  operands: BusinessOperand[]        // object/field picks in business labels
  category: BusinessCategory
  confidence?: number                 // assisted authoring only
}
```

**Rule:** Business Sentences are **never** stored as executable code — they compile to Intent Document fields.

### 3.9 Business Validation

Validation of business expression **before** Intent Document finalization.

| Check | Description |
|-------|-------------|
| Vocabulary | All terms resolve to Dictionary |
| Grammar | Sentence matches allowed patterns |
| Semantics | Operands compatible with category |
| Ambiguity | No unresolved synonym or conflicting operands |
| Policy | Tenant governance (approval, licensed capabilities) |
| Completeness | Required slots filled for category |

Output: `BusinessValidationSummary` + business-language diagnostics.

**Version constant:** `mak-business-validation-v1`

### 3.10 Business Semantics

**Meaning layer** — maps validated Business Sentences to Intent Document structure (goals, rules, conditions, actions) without exposing technical mapping to user.

| Semantic role | Intent field mapping (internal) |
|---------------|--------------------------------|
| Objective | `goals[]` |
| Rule | `rules[]` |
| Condition | `conditions[]` |
| Process step | `processRef` |
| Event trigger | `events[]` |
| Expected result | `outcomes[]` |

**Rule:** Semantic mapping is platform-owned — user sees only business confirmation summary.

### 3.11 Business Context

**Situational envelope** for authoring — scopes vocabulary, templates, and suggestions.

| Context facet | Examples |
|---------------|----------|
| `businessObjectId` | Entity being configured |
| `moduleId` | Module scope |
| `role` | User role — filters vocabulary |
| `workflowStage` | Draft vs review |
| `locale` | Localization |
| `tenantId` | Enterprise scope |

**Version constant:** `mak-business-context-v1`

### 3.12 Business Categories

Official **classification** of business expressions — drives grammar, templates, and validation rules.

| Category | User expresses |
|----------|----------------|
| **Objective** | What the business wants to achieve |
| **Rule** | Constraint or derivation in business terms |
| **Process** | Sequence of business steps |
| **Event** | Something that happens in the business |
| **Condition** | When something applies |
| **Outcome** | Expected result or metric |
| **Integration** | Business need to connect systems (no API names) |
| **Insight** | Dashboard/report need in business terms |
| **Automation** | When X happens, business expects Y |
| **Permission** | Who may do what (role names, not ACL JSON) |

### 3.13 Business Confirmation

**Explicit user approval** before Intent Document is finalized and sent to Resolver.

| Step | User sees |
|------|-----------|
| Summary | Plain-language recap of objectives, rules, conditions, results |
| Impact hint | Business-facing "this will affect…" (not technical) |
| Confirm / Edit | User confirms or returns to authoring |
| Audit | Confirmation recorded with actor + timestamp |

**Rule:** No Resolver invocation without confirmed Intent (D-059 lifecycle **Review** stage).

### 3.14 Business Suggestions

Platform-generated **proposals** to complete or improve business expression — vocabulary picks, template matches, missing operands.

| Source | Example |
|--------|---------|
| Dictionary | "Did you mean **Receita Líquida**?" |
| Template | "Similar rule exists: **Desconto máximo**" |
| Context | Fields available on current Business Object |
| History | Prior approved Intents in Library |

**Rule:** Suggestions are **opt-in** — user accepts or ignores; never auto-applied without confirmation.

### 3.15 Business Wizards

Multi-step **guided flows** that collect business expression across steps — each step uses Business Language only.

| Wizard type | Collects |
|-------------|----------|
| Objective wizard | Goals + success criteria |
| Rule wizard | Conditions + outcomes |
| Process wizard | Steps + events + approvals |
| Computation wizard | What to calculate, in business terms |

**Output:** Draft Intent Document sections — validated incrementally.

### 3.16 Business Guided Authoring

**Step-by-step authoring** with picks, lists, and confirmations — primary non-AI path (D-059 Guided Authoring facet).

| Characteristic | Rule |
|----------------|------|
| No free typing required | Picks from Dictionary + Templates |
| Progressive validation | Each step validated before next |
| Business labels only | Operands shown as field/entity names |

### 3.17 Business Visual Authoring

**Visual selection** of business concepts — cards, matrices, timelines — without formula canvas or workflow technical notation.

| Allowed | Forbidden |
|---------|-----------|
| Outcome cards, process timelines | AST nodes, expression trees |
| KPI pickers, threshold sliders (business units) | Function palette, code blocks |
| Relationship pickers (business names) | JSON editors, SQL views |

Visual selections compile to Business Sentences → Intent Document.

### 3.18 Business Assisted Authoring

**AI-accelerated** authoring — suggestions, completions, rephrasing — within Business Language boundaries.

| Allowed | Forbidden |
|---------|-----------|
| Draft Business Sentences for user review | Auto-publish Intent |
| Rephrase for clarity | Generate Formula / Workflow / code |
| Explain existing Intent in business terms | Resolve Intent to artifacts |

**Version constant:** `mak-business-assisted-authoring-v1`

### 3.19 Business Conversation

**Multi-turn dialogue** between user and platform (optionally AI-backed) to refine business expression.

| Turn | Behavior |
|------|----------|
| User | States objective, rule, or question in business language |
| Platform | Asks clarifying questions in business language |
| Resolution | Converges on validated Business Sentences |
| Output | Intent Document draft — not technical artifacts |

**Rule:** Conversation logs are business-language only in user view; technical traces internal.

### 3.20 Business Prompting

**Structured prompts** that elicit specific business information — "What should happen when the order total exceeds the credit limit?"

| Prompt type | Purpose |
|-------------|---------|
| Elicitation | Missing operand |
| Disambiguation | Multiple term matches |
| Confirmation | "Is this what you mean?" |
| Education | Explain capability in business terms |

### 3.21 Business Translation

**Locale and synonym translation** — maps user input to canonical tenant vocabulary.

| Direction | Use |
|-----------|-----|
| Synonym → Term | Authoring input normalization |
| Term → Locale label | Localization (§3.26) |
| Template → Tenant vocabulary | Marketplace import adaptation |

**Rule:** Translation never exposes technical identifiers to user.

### 3.22 Business Explainability

Platform explains **why** a validation failed, **why** a suggestion appeared, or **what** an approved Intent will cause — in business language only.

| Question | Answer source |
|----------|---------------|
| Why was this blocked? | Business Validation diagnostics |
| Why this suggestion? | Template / Dictionary match reason |
| What happens next? | Intent lifecycle stage (D-059) — "Platform will configure the calculation" |
| What changed? | Intent revision business diff |

**Forbidden:** Showing Resolver, Derivation, Engine, or Runtime details to business user.

### 3.23 Business Review

Optional **human review** stage before Intent approval — reviewer sees business summary only.

| Reviewer sees | Reviewer never sees |
|---------------|---------------------|
| Intent phrase, goals, rules, conditions | Formula Document, AST, projections |
| Impact summary (business objects affected) | Derivation ids, resolver internals |

Integrates with Intent lifecycle **Review** stage (D-059).

### 3.24 Business Approval

Formal **approval gate** — segregated from authoring when policy requires.

| Field | Purpose |
|-------|---------|
| `approverId` | Approving business role |
| `approvalStatus` | `pending` \| `approved` \| `rejected` |
| `approvalComment` | Business-language comment |

Approved Intent becomes eligible for Resolver invocation (D-064).

### 3.25 Business Evolution

Controlled **evolution** of vocabulary, templates, and authored Intents over time.

| Mechanism | Rule |
|-----------|------|
| Vocabulary semver | Deprecated terms flagged in authoring |
| Template version | New template version → optional Intent upgrade |
| Intent revision | User edits in business language → new revision |
| Migration | Business-language migration prompts — not technical migrations |

### 3.26 Business Localization

**Locale-specific** labels, synonyms, and prompts while preserving canonical term ids internally.

| Layer | Localizable |
|-------|-------------|
| Dictionary labels | Yes |
| Template phrases | Yes |
| Wizard prompts | Yes |
| Intent Document `intentPhrase` | User's authoring locale |
| Canonical term id | No — stable across locales |

**Version constant:** `mak-business-localization-v1`

### 3.27 Business Marketplace

Marketplace shares **business-language assets** — never implementations.

| Publishable | Never published |
|-------------|-----------------|
| Vocabulary packs | Resolver configs |
| Intent Templates | Formula Documents |
| Sentence patterns | Workflow JSON |
| Category packs | Engine settings |

Import flow: Marketplace pack → tenant Dictionary/Templates → user authors → Intent → Resolver (tenant-specific derivation).

### 3.28 Business Versioning

| Artifact | Version mechanism |
|----------|-------------------|
| Dictionary | Semver + effective date |
| Templates | Template version id |
| Grammar | `mak-business-grammar-v1` schema semver |
| Intent Document | `revision` monotonic (D-059) |

### 3.29 Business Metadata

Extensible metadata on language artifacts — governance, search, Marketplace.

| Facet | Examples |
|-------|----------|
| `governance` | steward, approval status |
| `provenance` | Marketplace pack id, AI-assisted flag |
| `classification` | category, sensitivity |
| `locale` | authoring locale |

### 3.30 Business Contracts

Normative contracts for Business Language inputs/outputs.

| Contract | Specifies |
|----------|-----------|
| Sentence → Intent | Semantic mapping invariants |
| Validation | Required checks before Intent finalize |
| Confirmation | Mandatory fields before Resolver |
| AI assist | User approval required |
| Vocabulary | Approved term resolution |

**Version constant:** `mak-business-language-contract-v1`

### 3.31 Business Compatibility

Ensures business expressions remain valid across vocabulary, template, and Intent schema evolution.

| Dimension | Rule |
|-----------|------|
| Deprecated terms | Authoring warns; blocks until updated |
| Template version | Old Intents pin template version |
| Grammar version | Breaking grammar → migration wizard |
| Cross-module | Compatibility matrix for template reuse |

---

## 4. Official policies

### 4.1 How Business Intent is born

```
User need (objective, rule, process, event, condition, result)
        ↓
Business Language expression (any authoring mode §3.15–§3.18)
        ↓
Business Validation + Semantics (§3.9–§3.10)
        ↓
Ambiguity resolution (§4.5)
        ↓
Business Confirmation (§3.13)
        ↓
[Optional] Business Review + Approval (§3.23–§3.24)
        ↓
Business Intent Document finalized (D-059)
        ↓
Intent Resolver (D-064) — user never participates in this stage directly
```

**Birth invariant:** Every Intent Document field originates from validated Business Sentences or Template parameters — never from technical editors.

### 4.2 How the user converses with the platform

| Channel | Description |
|---------|-------------|
| **Guided** | Wizards and step flows (§3.15–§3.16) |
| **Visual** | Cards, pickers, timelines (§3.17) |
| **Conversational** | Multi-turn Business Conversation (§3.19) |
| **Template** | Clone and customize business patterns (§3.7) |
| **Catalog** | Pick pre-approved business patterns (D-059 Catalog) |

All channels produce the **same** Intent Document contract. The platform always responds in **business language** — prompts, diagnostics, confirmations, explainability.

### 4.3 How AI assists

| AI role | Permitted | Forbidden |
|---------|-----------|-----------|
| Draft sentences | Suggest Business Sentences for review | Auto-finalize Intent |
| Disambiguate | Propose term matches | Bypass Validation |
| Rephrase | Improve clarity | Emit technical artifacts |
| Explain | Summarize Intent / validation | Show Resolver/Derivation internals |
| Template match | Suggest templates | Import implementations from external code |

**Permanent rule (consistent with D-063 §11, D-064 §10):** AI produces **business-language candidates** only. User confirms. Resolver performs all technical derivation.

### 4.4 How the platform works without AI

| Capability | Non-AI path |
|------------|-------------|
| Expression | Guided + Visual + Templates + Dictionary picks |
| Validation | Rule-based Business Validation (§3.9) |
| Disambiguation | Structured Business Prompting (§3.20) |
| Suggestions | Dictionary + Template + Context rules (§3.14) |
| Confirmation | Business Confirmation flow (§3.13) |

**BL-10:** Full platform authoring and Intent creation **without any AI** — AI is optional acceleration.

### 4.5 How the user confirms intentions

1. Platform presents **business summary** — objectives, rules, conditions, expected results
2. Platform highlights **ambiguities resolved** and **operands chosen**
3. User selects **Confirm** or **Edit**
4. On Confirm → Intent Document revision saved → eligible for Review/Approval/Resolve
5. Confirmation immutable in audit trail

No "silent save" to approved Intent — explicit confirmation required.

### 4.6 How the platform avoids ambiguities

| Technique | When |
|-----------|------|
| Synonym resolution | Multiple term matches |
| Business Prompting | Missing operand |
| Grammar validation | Invalid sentence structure |
| Semantic check | Incompatible operands for category |
| Conflict detection | Contradictory rules in same context |
| Blocking diagnostics | Unresolved ambiguity — Intent not finalized |

**Rule:** Ambiguity is **never** resolved by guessing technical mapping — always by user clarification in business language.

### 4.7 How the user never visualizes technical implementations

| User boundary | Platform enforcement |
|---------------|------------------------|
| No Formulas | Computation expressed as business outcomes; Formula Builder is Studio projection editor — not business authoring surface |
| No AST / JSON / Code / SQL | Never rendered in Business Language surfaces |
| No Engines | Expression, Computation, Dependency engines invisible |
| No Runtime | Execution outcomes described in business terms only |
| No Resolver/Derivation | Post-Intent pipeline fully hidden (Technology Transparency) |

Studio **projection editors** (Formula Builder, etc.) are **technical paths** for implementers/support — not the Business Language user path. Business users author exclusively through Business Language → Intent.

### 4.8 How the platform explains decisions

| Decision type | Explanation |
|-------------|-------------|
| Validation block | Business Validation diagnostic + suggestion |
| Suggestion offered | Why template/term matched |
| Approval required | Policy reason in business terms |
| Post-confirm next step | "Your intention will be applied to **Pedidos**" — not "Resolver will emit compute.formula" |
| Intent change impact | Business diff — affected objects and behaviors described in business language |

Downstream Resolver Explainability (D-064) is **translated** to business language before user display — never shown raw.

---

## 5. Official authoring pipeline

```
Business User Expression
(Objectives · Rules · Processes · Events · Conditions · Results)
        ↓
Business Context assembly
        ↓
Vocabulary + Synonym resolution
        ↓
Grammar + Sentence construction
        ↓
Business Validation
        ↓
Business Semantics → Intent fields
        ↓
Business Confirmation
        ↓
[Review / Approval]
        ↓
Business Intent Document (D-059)
        ↓
[Hidden from user]
Intent Resolver (D-064) → Derivation (D-063) → Studio → MDP → Runtime
```

---

## 6. Integration contracts

| Component | Relationship |
|-----------|--------------|
| **Business Intent Authoring** (D-059) | Consumes Business Language output; Intent Document SSOT |
| **Enterprise Vocabulary** (Knowledge) | Dictionary backend; Business Language surfaces terms |
| **Business Capability** | Capability names in business prompts — not API ids |
| **Business Objects** | Operands labeled with object/field business names |
| **Intent Resolver** (D-064) | Downstream — triggered only after confirmed Intent |
| **Business Derivation** (D-063) | Never visible to business user |
| **Marketplace** | Shares vocabulary packs and templates (§3.27) |
| **Platform Language Standard** (D-015) | Orthogonal — platform doc nomenclature vs user business language |

---

## 7. Document authority map

| Topic | SSOT |
|-------|------|
| Business user language | **This document** (D-065) |
| Platform technical nomenclature | [MAK-PLATFORM-LANGUAGE-STANDARD.md](./MAK-PLATFORM-LANGUAGE-STANDARD.md) |
| Intent Document & lifecycle | [MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md](./MAK-BUSINESS-INTENT-AUTHORING-ARCHITECTURE.md) |
| Intent resolution | [MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md](./MAK-BUSINESS-INTENT-RESOLVER-ARCHITECTURE.md) |
| Derivation | [MAK-BUSINESS-DERIVATION-ARCHITECTURE.md](./MAK-BUSINESS-DERIVATION-ARCHITECTURE.md) |
| Enterprise Vocabulary storage | [MAK-KNOWLEDGE-ARCHITECTURE.md](./MAK-KNOWLEDGE-ARCHITECTURE.md) |

---

## 8. Identified architectural risks (Program 3.6.8)

| Risk | Mitigation | Residual |
|------|------------|----------|
| Overlap with Intent Authoring (D-059) | Clear split: D-065 = language layer; D-059 = Intent artifact & lifecycle | Low — cross-linked |
| Overlap with Platform Language Standard | D-015 = platform terms; D-065 = tenant business user terms | Low |
| Studio Formula Builder confusion | BL-7 + §4.7 — business path vs projection editor path | Medium — UX discipline in 3.7+ |
| AI overreach | BL-9 + confirmation gates | Low |
| Free-text ambiguity | Structured grammar + blocking validation | Medium — impl in 3.7+ |

**No blocking conflict** with Intent, Resolver, Derivation, Capability, Computation, Formula Builder, or Foundation.

---

## 9. Architecture completion declaration (Program 3.6.8)

Upon acceptance of **D-065**, the **Studio Intelligence architecture stack** for Intent-driven derivation is **complete**:

| Program | Architecture | Decision |
|---------|--------------|----------|
| 3.4 | Business Intent Authoring | D-059 |
| 3.6 | Business Derivation | D-063 |
| 3.6.5 | Business Intent Resolver | D-064 |
| **3.6.8** | **Business Language** | **D-065** |

**Permanent rule (D-065):** **No new architecture documentation programs** shall start before **Program 3.7 — Business Intent Resolver Implementation** (G304) is delivered. All subsequent work is **implementation** against frozen architecture.

---

## 10. Gate plan — Program 3.7

| Gate | Scope |
|------|-------|
| **G304** | Intent Resolver Implementation — must consume Business Intent Documents produced via Business Language contract |

Business Language UI implementation may ship as part of Program 3.7 or follow-on Studio missions — but **must** conform to this architecture.

---

*Amendments require Decision + ENGINEERING-JOURNAL entry. Next mission: **Program 3.7 — Business Intent Resolver Implementation** (G304) — architecture stack frozen.*
