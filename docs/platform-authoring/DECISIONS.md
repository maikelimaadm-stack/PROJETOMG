# Universal Authoring Decisions (D-UA)

**Status:** Official SSOT · **Version:** 1.0.0 · **Mission:** Foundation B.7

---

## D-UA-01 — UAS is authoritative over Studio UI

**Decision:** Studio (Foundation D) **implements** UAS designers and wizards — it does not define authoring semantics. See [04-UNIVERSAL-DESIGNERS.md](./04-UNIVERSAL-DESIGNERS.md).

---

## D-UA-02 — Configuration not code

**Decision:** 95% of enterprise scenarios resolved via MMM configuration only ([24-LOW-CODE-PHILOSOPHY.md](./24-LOW-CODE-PHILOSOPHY.md)). Code reserved for signed plugins (D-PA-23).

---

## D-UA-03 — Universal creation order

**Decision:** Mandatory sequence in [01-UNIVERSAL-AUTHORING-OVERVIEW.md](./01-UNIVERSAL-AUTHORING-OVERVIEW.md) — no skip paths.

---

## D-UA-04 — Authoring Language (UAL)

**Decision:** Official DSL is **mak-uas-v1** — properties, bindings, expressions, formulas, validations ([02-UNIVERSAL-AUTHORING-LANGUAGE.md](./02-UNIVERSAL-AUTHORING-LANGUAGE.md)). Not JavaScript, not SQL.

---

## D-UA-05 — Property system unified

**Decision:** All MMM payload properties follow [03-UNIVERSAL-PROPERTY-SYSTEM.md](./03-UNIVERSAL-PROPERTY-SYSTEM.md) — required/optional, inheritance, profiles.

---

## D-UA-06 — Designer catalog closed at 28

**Decision:** Twenty-eight normative designers (17 core + 11 extended). New designers require D-UA amendment + MMM additive type (R-19).

---

## D-UA-07 — Wizards produce MMM drafts

**Decision:** Wizards create **draft** MMM object graphs — never published directly ([05-UNIVERSAL-WIZARDS.md](./05-UNIVERSAL-WIZARDS.md)).

---

## D-UA-08 — Formula language closed functions

**Decision:** Formula DSL function catalog closed in [07-UNIVERSAL-FORMULA-LANGUAGE.md](./07-UNIVERSAL-FORMULA-LANGUAGE.md). No eval(), no arbitrary code.

---

## D-UA-09 — Validation language declarative

**Decision:** Validations are declarative rules — [08-UNIVERSAL-VALIDATION-LANGUAGE.md](./08-UNIVERSAL-VALIDATION-LANGUAGE.md).

---

## D-UA-10 — Expression dependency graph

**Decision:** Expressions resolve via acyclic dependency graph at publish (C-5).

---

## D-UA-11 — Binding types closed

**Decision:** Four binding kinds: data, action, event, workflow — topics 10–13.

---

## D-UA-12 — API binding protocols

**Decision:** Supported connector protocols listed in [14-UNIVERSAL-API-BINDING.md](./14-UNIVERSAL-API-BINDING.md).

---

## D-UA-13 — Template inheritance

**Decision:** Templates use `extendsRef` + override layers ([16-UNIVERSAL-TEMPLATE-SYSTEM.md](./16-UNIVERSAL-TEMPLATE-SYSTEM.md)).

---

## D-UA-14 — Review uses USM

**Decision:** Authoring review follows USM draft→in_review→approved ([18-UNIVERSAL-REVIEW-SYSTEM.md](./18-UNIVERSAL-REVIEW-SYSTEM.md)).

---

## D-UA-15 — Versioning immutable publish

**Decision:** Published DefinitionVersions immutable; diff/compare on revisions ([19-UNIVERSAL-VERSIONING.md](./19-UNIVERSAL-VERSIONING.md)).

---

## D-UA-16 — Collaboration optimistic lock

**Decision:** Multi-user via revision lock + comments ([20-UNIVERSAL-COLLABORATION.md](./20-UNIVERSAL-COLLABORATION.md)).

---

## D-UA-17 — Marketplace authoring isolation

**Decision:** Publisher scope ≠ tenant install scope ([21-UNIVERSAL-MARKETPLACE-AUTHORING.md](./21-UNIVERSAL-MARKETPLACE-AUTHORING.md)).

---

## D-UA-18 — AI never direct create

**Decision:** AI → AICandidate → human review → Intent → MMM draft ([22-AI-AUTHORING.md](./22-AI-AUTHORING.md)).

---

## D-UA-19 — Manual path always available

**Decision:** Every wizard capability available manually ([23-MANUAL-AUTHORING.md](./23-MANUAL-AUTHORING.md)).

---

## D-UA-20 — Business Language primary entry

**Decision:** BOS Business Language is default authoring entry; Studio is expert mode (D-074).

---

## D-UA-21 — Screen vs Layout designers

**Decision:** **Layout Designer** = structure; **Screen Designer** = layout + default view + route binding.

---

## D-UA-22 — Entity Designer alias

**Decision:** Entity Designer ≡ Business Object Designer — single MMM type `business_object`.

---

## D-UA-23 — Rule Designer scope

**Decision:** Rule Designer covers automation rules + business rules (V16/V19 cross-ref).

---

## D-UA-24 — Localization via property profiles

**Decision:** Localization Designer edits label/message profiles — not duplicate objects.

---

## D-UA-25 — Theme tokens only

**Decision:** Theme Designer edits `style_token` — no raw CSS in MMM.

---

## D-UA-26 — Foundation C blocked until B.7

**Decision:** Foundation C authorized only after B.7 audit PASS ([25-AUDITORIA-FINAL.md](./25-AUDITORIA-FINAL.md)). Supersedes D-UP-25 until merge.

---

## D-UA-27 — Authoring compiles to CRB

**Decision:** All authoring output compiles via Publish Engine — authors never write CRB.

---

## D-UA-28 — Wizard idempotency

**Decision:** Re-running wizard on existing scope creates new draft branch (fork), not overwrite.

---

## D-UA-29 — Connector credentials external

**Decision:** Connectors reference secretRef — never inline secrets in authoring payload.

---

## D-UA-30 — Dashboard/widget data binding

**Decision:** Widgets bind via Query definitions — same as Report Designer subset.

---

## D-UA-31 — Navigation requires published module

**Decision:** Routes/menu items require parent module at least `approved`.

---

## D-UA-32 — Permission Designer RBAC model

**Decision:** role → permission → resource:action — compiled to CRB V18.

---

## D-UA-33 — Intent Designer templates

**Decision:** Intent Designer saves reusable `derivation_plan` templates — not live Intent documents.

---

## D-UA-34 — Five pillars complete

**Decision:** meta-model + architecture + behavior + protocol + **authoring** = complete SSOT before Foundation C.

---

## D-UA-35 — Last doc block before Runtime

**Decision:** B.7 is the final documentation foundation before Foundation C and Foundation D (Studio) implementation.

---

*End of document.*
