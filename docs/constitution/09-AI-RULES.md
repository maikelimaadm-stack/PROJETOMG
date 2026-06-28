# 09 — AI Rules

**Constitution document:** 09 of 10  
**Status:** Official  
**Version:** 1.0.0

---

## 1. Purpose

MAK Gestão is developed with AI assistance (Cursor Cloud Agents, Copilot, etc.). These rules ensure AI contributors **do not erode Foundation**, **do not rely on chat memory**, and **produce verifiable output**.

AI agents are subject to the same Constitution as human developers — with additional constraints below.

---

## 2. Mandatory Reading Order

Before any implementation mission, AI must read:

1. [00-MAK-CONSTITUTION.md](./00-MAK-CONSTITUTION.md)
2. Mission-specific Constitution docs (03–08, 10 as relevant)
3. `/workspace/AGENTS.md` (operational commands)
4. `scripts/governance-baseline.json` (if touching Foundation/modules/generator)

For cadastro work, also read:

- [04-MODELOBASE1-RULES.md](./04-MODELOBASE1-RULES.md)
- [08-DO-NOT-DO-LIST.md](./08-DO-NOT-DO-LIST.md)

**Chat history from previous sessions is not authoritative.**

---

## 3. Evidence-Based Work

AI must:

| Rule | Requirement |
|------|-------------|
| E1 | Cite code with file paths when claiming architecture facts |
| E2 | Read actual files before editing — never assume from memory |
| E3 | Run gates/build/lint after Foundation-touching changes |
| E4 | Report gate failures honestly — not silence or skip |
| E5 | Distinguish "exists in code" vs "planned in vision" |

AI must **not**:

- Cite old audit/report conclusions without re-verifying in current code
- Claim gates pass without running them
- Invent modules, engines, or Studio features that do not exist

---

## 4. Scope Discipline

| Mission type | AI behavior |
|--------------|-------------|
| **Documentary** (e.g. Mission 0.1) | Create docs only — no code changes |
| **Domain feature** | Edit module config/backend only — no structural UI |
| **Foundation fix** | Minimal diff + full `verify:governance` |
| **New module** | Generator only — never manual page scaffold |
| **Audit** | Read-only — no fixes unless mission says so |

When mission says "do not alter X", AI must not alter X — even if it found a bug.

---

## 5. Foundation Protection

AI is **explicitly forbidden** from:

1. Refactoring ModeloBase1 or framework/mak without Foundation mission
2. Adding structural components to domain modules
3. Widening `governance-baseline.json` allowlists to make gates pass
4. Removing or commenting out gate checks
5. Creating "temporary" structural duplicates (temp becomes permanent)

If AI detects a Foundation bug during a domain mission:

- **Record** in report/Tech Debt (future mission)
- **Do not fix** unless mission authorizes

---

## 6. Generator Usage

Creating new cadastro modules:

```bash
npm run generate:module -- \
  --moduleId {id} \
  --entityName {Entity}Cadastro \
  --singularLabel {Singular} \
  --pluralLabel {Plural} \
  --repository {repo} \
  --api {Api} \
  --schema {schema} \
  --dry-run   # first run to validate
```

AI must run `--dry-run` first when uncertain, then generate without dry-run.

Post-generate checklist:

- [ ] `gate:generator` passes
- [ ] Backend migration created if new model
- [ ] Registries updated (frontend + backend)
- [ ] `gate:governance` passes

---

## 7. Documentation Obligations

AI must update Constitution docs when:

- A new gate suite is added (V21+)
- A formal exception is granted
- A promotion changes Foundation boundaries
- Amendment Process is executed

AI must **not** create Constitution docs outside Mission authorization (e.g. no Roadmap in Mission 0.1).

Documentation quality bar:

- Enterprise prose — complete sentences
- Reflect actual code state
- No generic filler
- Cross-link related Constitution docs

---

## 8. Communication Standards

AI responses to humans:

- Use code citations: ` ```startLine:endLine:path` ` format
- State verification performed (build, gates, file reads)
- Separate facts from recommendations
- List inconsistencies found — do not hide them
- No engagement baiting; proportional detail

---

## 9. Git and PR Behavior (Cloud Agents)

When authorized to commit:

1. Use branch prefix `cursor/` with mission suffix
2. Descriptive commit messages — complete sentences
3. Push before claiming completion
4. Create/update PR for documentary missions when cloud workflow requires
5. Do not force-push or rewrite history

Documentary-only missions may skip PR if explicitly instructed — Mission 0.1 did not forbid PR but forbade refactoring PRs.

---

## 10. Known Platform State (AI Quick Reference)

Verified baseline for AI — re-verify if code changed:

| Fact | Value |
|------|-------|
| Certified runtime modules | empresas, marcas, produtos, cadcps |
| Foundation version | V10.1.0 frozen 2026-06-27 |
| Config engines | V13–V20 (all gate-certified) |
| MAK Studio | Not in codebase |
| Generator | `scripts/generate-cadastro-module.mjs` |
| Primary verification | `npm run verify:governance` |
| Legacy layer | `framework/cadastro/` — do not extend |
| Grouping | Disabled — do not re-enable |

---

## 11. Conflict Resolution

| Conflict | Resolution |
|----------|------------|
| User request vs Constitution | Constitution wins — explain and propose amendment |
| User request vs mission "do not" | Mission wins |
| Gate failure vs deadline | Fix code — never disable gate |
| Two docs disagree | Constitution > baseline > gates > other docs |

---

## 12. Self-Check Before Completion

AI must answer:

1. Did I read Constitution docs relevant to this mission?
2. Did I stay within mission scope?
3. Did I verify claims against current code?
4. Did I run required gates/build?
5. Did I document inconsistencies found?
6. Did I avoid all items in Do-Not-Do List?

If any answer is "no", complete before reporting done.

---

*Next: [10-PLATFORM-BOUNDARIES.md](./10-PLATFORM-BOUNDARIES.md)*
