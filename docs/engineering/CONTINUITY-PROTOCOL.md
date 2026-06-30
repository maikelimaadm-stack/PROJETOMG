# Continuity Protocol — MAK Gestão Platform

**Status:** Official — Permanent cross-session continuity rules  
**Version:** 1.0.0  
**Effective date:** 2026-06-30  
**Decision:** D-053 — Project Continuity Protocol  
**Mission:** Program 2.3.Y

---

## 1. Purpose

Define how the MAK Gestão project continues across:

- New Cursor chats / Cloud Agents
- Claude Code sessions
- ChatGPT or other LLM assistants
- Future AI tools not yet defined

**Principle:** The repository is the only memory. Chat history is never authoritative.

---

## 2. Core Rules

| # | Rule |
|---|------|
| 1 | **No chat dependency** — All state lives in git + `docs/` |
| 2 | **PROJECT-STATUS.md is the position SSOT** — Read it first after this protocol |
| 3 | **Decisions are in DECISIONS.md** — Never accept "we decided in chat" without D-XXX |
| 4 | **Programs are in ROADMAP.md** — Next mission comes from roadmap + brief, not chat |
| 5 | **Foundation freeze is binding** — D-052 until Computation Engine certified |
| 6 | **Certification is mandatory** — 10 questions from README_AI at mission end |
| 7 | **RHP is mandatory** — Repository Health Protocol at start and end of every mission |

---

## 3. Tool-Specific Handoff

### Cursor (IDE / Cloud Agent)

1. Open repository at latest `main`
2. Read [AI-STARTUP-GUIDE.md](./AI-STARTUP-GUIDE.md)
3. Read [PROJECT-STATUS.md](./PROJECT-STATUS.md)
4. Read [AGENTS.md](../../AGENTS.md) for commands
5. Create branch `cursor/<mission>-579b`
6. At end: commit, push, PR, update docs

**Cloud Agent notes:** Branch suffix `-579b` is convention. PRs target `main`.

### Claude Code

1. Clone/pull `main` from GitHub
2. Follow [AI-STARTUP-GUIDE.md](./AI-STARTUP-GUIDE.md) reading order
3. Use same branch naming if contributing via PR
4. Run same verification commands (`verify:governance`, etc.)

### ChatGPT / External LLMs

1. User provides link to repo or relevant doc excerpts
2. AI must ask user to confirm [PROJECT-STATUS.md](./PROJECT-STATUS.md) date/version
3. AI must not assume chat context from prior sessions
4. Output plans referencing official doc paths only

### Future AI Tools

Must comply with:

- [Constitution](../constitution/00-MAK-CONSTITUTION.md)
- [README_AI.md](../../README_AI.md)
- This protocol
- [PLATFORM-IMPLEMENTATION-PROTOCOL.md](./PLATFORM-IMPLEMENTATION-PROTOCOL.md)

---

## 4. Session Start Checklist (Copy-Paste)

```
□ git pull origin main
□ Read PROJECT-STATUS.md (date + next mission)
□ Read mission brief (IFM-PHASE-*.md)
□ Confirm Foundation freeze scope (D-052)
□ npm run build && npm run lint
□ npm run verify:governance (or verify:ci)
□ Create feature branch
```

---

## 5. Session End Checklist (Copy-Paste)

```
□ All gates pass for changed scope
□ CURRENT-STATE.md updated
□ PROJECT-STATUS.md updated (if program/version changed)
□ ENGINEERING-JOURNAL.md entry added
□ DECISIONS.md updated (if new D-XXX)
□ ROADMAP.md updated (if program completed)
□ Certification report (if program mission)
□ README_AI § CURRENT PROJECT STATUS updated (if needed)
□ PR created/updated with clear program ID
□ 10-item certification answered (README_AI)
```

---

## 6. Information Hierarchy

When documents conflict, resolve in this order:

```
1. Constitution (docs/constitution/)
2. Master Architecture
3. Engineering Principles
4. DECISIONS.md (D-XXX records)
5. PROJECT-STATUS.md (current position)
6. ROADMAP.md (sequence)
7. CURRENT-STATE.md (detailed state)
8. Mission briefs & certification reports
9. Chat / external notes (never authoritative)
```

---

## 7. Continuity Documents Index

| Document | Role |
|----------|------|
| [PROJECT-STATUS.md](./PROJECT-STATUS.md) | **Where we are** |
| [AI-STARTUP-GUIDE.md](./AI-STARTUP-GUIDE.md) | **How to onboard** |
| [CONTINUITY-PROTOCOL.md](./CONTINUITY-PROTOCOL.md) | **This file — handoff rules** |
| [DOCUMENT-MAP.md](./DOCUMENT-MAP.md) | **Full doc hierarchy L0–L7** |
| [README_AI.md](../../README_AI.md) | **AI rules & certification** |

---

## 8. Long-Term Continuity Guarantee

This protocol ensures the project can evolve for **10–20+ years** because:

- Every program leaves a certification report + decision record
- Gates enforce architecture mechanically (`scripts/gate-*.mjs`)
- Version tags mark stable points (`v0.4.0-RC1`)
- No architectural knowledge is trapped in ephemeral chat sessions

---

*Violations of this protocol (e.g. implementing without reading PROJECT-STATUS) must be caught in PR review or governance gates.*
