# AI Startup Guide — MAK Gestão Platform

**Status:** Official — Mandatory first read for any new AI session  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Mission:** Program 2.3.Y — Project Transition & Continuity Preparation

> **You do not need chat history.** This guide plus the linked documents contain everything required to continue development from the exact current point.

---

## 1. What This Guide Is

This document tells any AI (Cursor, Claude Code, ChatGPT, or future tools) **how to onboard** to the MAK Gestão repository in under 15 minutes of reading.

**Single source of project position:** [PROJECT-STATUS.md](./PROJECT-STATUS.md)

---

## 2. Mandatory Reading Order

Read in this order before touching code:

| Step | Document | Path | Purpose |
|------|----------|------|---------|
| **0** | **This guide** | `docs/engineering/AI-STARTUP-GUIDE.md` | How to onboard |
| **1** | **AI entry point** | [README_AI.md](../../README_AI.md) | Rules, checklist, certification |
| **2** | **Project status** | [PROJECT-STATUS.md](./PROJECT-STATUS.md) | **Where the project is right now** |
| **3** | **Constitution** | [docs/constitution/00-MAK-CONSTITUTION.md](../constitution/00-MAK-CONSTITUTION.md) | Highest authority |
| **4** | **Master Architecture** | [MAK-2035-MASTER-ARCHITECTURE.md](../architecture/MAK-2035-MASTER-ARCHITECTURE.md) | Platform map L0–L7 |
| **5** | **Engineering Principles** | [MAK-ENGINEERING-PRINCIPLES.md](../architecture/MAK-ENGINEERING-PRINCIPLES.md) | 18 permanent principles (D-029) |
| **6** | **Roadmap** | [ROADMAP.md](./ROADMAP.md) | Official program sequence |
| **7** | **Current state** | [CURRENT-STATE.md](./CURRENT-STATE.md) | Detailed living platform state |
| **8** | **Decisions** | [DECISIONS.md](./DECISIONS.md) | Architectural decision log |
| **9** | **Studio Architecture** | [MAK-STUDIO-ARCHITECTURE.md](../architecture/MAK-STUDIO-ARCHITECTURE.md) | Studio layers & dependency stack |
| **10** | **Vision Backlog** | [MAK-2040-VISION-BACKLOG.md](../vision/MAK-2040-VISION-BACKLOG.md) | Long-term vision items |
| **11** | **Continuity protocol** | [CONTINUITY-PROTOCOL.md](./CONTINUITY-PROTOCOL.md) | Cross-tool handoff rules |
| **12** | **Dev commands** | [AGENTS.md](../../AGENTS.md) | Build, test, dev workflow |

**Optional by mission type:**

| Mission type | Also read |
|--------------|-----------|
| Studio implementation | Mission brief in `docs/engineering/IFM-PHASE-*.md` + last certification report |
| MDP / metadata | [MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md](../architecture/MAK-DATA-PLATFORM-ARCHITECTURE-SPECIFICATION.md) |
| Governance / gates | [06-GOVERNANCE-AND-GATES.md](../constitution/06-GOVERNANCE-AND-GATES.md) |
| New program | [PLATFORM-IMPLEMENTATION-PROTOCOL.md](./PLATFORM-IMPLEMENTATION-PROTOCOL.md) |

---

## 3. How to Discover Project State

### Where is the project?

→ **[PROJECT-STATUS.md](./PROJECT-STATUS.md)** — version, release, program, decisions, gates, next mission.

### What is the next Program?

→ **[PROJECT-STATUS.md § Program Tracking](./PROJECT-STATUS.md#program-tracking)**  
→ **[ROADMAP.md § Phase 4 MAK Studio](./ROADMAP.md#phase-4--mak-studio-program-2--official-next)**

**Current answer (2026-06-30):** **Program 2.3.6 — Studio Computation Engine**

### What was the last Decision?

→ **[DECISIONS.md](./DECISIONS.md)** — scroll to bottom for latest `D-XXX`  
**Current:** **D-052** — Studio Foundation Freeze

### Is Foundation frozen?

→ **YES** — Enterprise Foundation (V10.2.0) + Studio Foundation (D-052).  
Do not add Foundation layers without new Decision + gate.

### What is the current version?

→ `package.json` → **`0.4.0-rc.1`**  
→ Git tag → **`v0.4.0-RC1`**

### What is the Release Candidate?

→ **`v0.4.0-RC1`** — consolidates Studio Programs 2.0–2.3.5 in `main`

### What was the last certified Program?

→ **Program 2.3.5** — Studio Evaluation Engine (G301, D-051)  
→ Stabilization **Program 2.3.X** (D-052) consolidated everything into `main`

---

## 4. How to Start a New Mission

### Step 1 — Confirm scope

1. Read [PROJECT-STATUS.md](./PROJECT-STATUS.md)
2. Read the mission brief (e.g. [IFM-PHASE-2.3.6-COMPUTED-DERIVED-FIELDS-BRIEF.md](./IFM-PHASE-2.3.6-COMPUTED-DERIVED-FIELDS-BRIEF.md))
3. Verify mission does not violate Foundation freeze (D-052)

### Step 2 — Repository health (RHP start)

```bash
git checkout main && git pull origin main
npm run build
npm run lint
npm run verify:governance   # or verify:ci for full mirror
```

### Step 3 — Create branch

```bash
git checkout -b cursor/<descriptive-mission-name>-579b
```

### Step 4 — Implement following PIP

Follow [PLATFORM-IMPLEMENTATION-PROTOCOL.md](./PLATFORM-IMPLEMENTATION-PROTOCOL.md) — 10 phases including D-028 impact gate and D-029 principles.

### Step 5 — Mission completion

Update mandatory docs:

| Document | Always? |
|----------|---------|
| `CURRENT-STATE.md` | ✅ |
| `PROJECT-STATUS.md` | ✅ if program/version/release changed |
| `ENGINEERING-JOURNAL.md` | ✅ |
| `DECISIONS.md` | If new decision |
| `ROADMAP.md` | If program completed |
| Certification report | If program mission |
| `README_AI.md` § CURRENT PROJECT STATUS | If status fields changed |

Run RHP end + 10-item certification from [README_AI.md](../../README_AI.md).

---

## 5. Key Paths (Quick Reference)

| Area | Path |
|------|------|
| Studio public API | `src/studio/index.js` |
| Studio dependency stack | `src/studio/governance/studioArchitectureConstants.js` |
| Layout designer | `src/studio/designers/layout/` |
| Field designer | `src/studio/designers/field/` |
| Backend API | `backend/src/` |
| Foundation | `src/framework/mak/` (frozen — do not bypass) |
| Gates | `scripts/gate-*.mjs` |
| E2E | `e2e/` |

---

## 6. What NOT to Do

- ❌ Rely on chat history as source of truth
- ❌ Extend `src/framework/cadastro/` (legacy)
- ❌ Create parallel Studio engines/registries (gates forbid)
- ❌ Modify Studio Foundation layers during 2.3.6 without respecting D-052
- ❌ Skip `verify:governance` before PR
- ❌ Implement features not in the active Program brief

---

## 7. Default Dev Workflow

```bash
cp .env.local.example .env.local   # if missing
npm run dev                        # http://127.0.0.1:5173 — proxies to Railway API
```

Full local stack: see [AGENTS.md](../../AGENTS.md) and [LOCAL_DEV.md](../../LOCAL_DEV.md).

---

*Any AI that completes Steps 1–2 of §4 is ready to implement the next official mission.*
