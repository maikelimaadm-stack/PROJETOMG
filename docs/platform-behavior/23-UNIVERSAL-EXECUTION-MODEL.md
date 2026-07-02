# 23 — Universal Execution Model

**Status:** Official SSOT · **Version:** 1.0.0 · **Decision:** D-PB-30

---

## Single dispatcher

All execution routes through **Universal Execution Dispatcher (UED)** at RT-8.

```mermaid
flowchart TD
  UI[UI Trigger] --> UED[Universal Execution Dispatcher]
  EVT[Domain Event] --> UED
  TIM[Timer] --> UED
  UED --> AE[Action Engine]
  UED --> WE[Workflow Engine]
  UED --> AU[Automation Engine]
  UED --> AI[AI Tool Handler]
  AE --> GR[Generic Repository]
  AE --> EXT[External API]
  WE --> GR
  AU --> EVT2[Emit Events]
```

---

## Runtime execution

| Step | Behavior |
|------|----------|
| 1 | Receive execution request |
| 2 | RT-5 authorize |
| 3 | Load handler from registry |
| 4 | Validate preconditions |
| 5 | Execute in transaction boundary |
| 6 | Emit events post-commit |
| 7 | Return structured result |

---

## Action Engine execution

| actionKind | Handler |
|------------|---------|
| crud | GR create/update/delete |
| navigate | Router push |
| workflow | Start workflow instance |
| integration | External API call |
| marketplace | Install/update package |
| lifecycle | MMM operation (Studio scope) |

---

## Workflow execution

| Step | Behavior |
|------|----------|
| Start | Create instance (idle→running) |
| Step | Execute step handler |
| Human | Transition to waiting |
| Timer | Scheduler callback → UED |
| Complete | Terminal state + events |

Single active step per instance.

---

## Automation execution

| Trigger | Behavior |
|---------|----------|
| `record.created` | Match rules → UED |
| `record.updated` | Field change rules |
| Schedule | Cron → UED |

Rules from CRB automation registry (V19 extension).

---

## AI execution

| Step | Behavior |
|------|----------|
| Request | AI Gateway — rate limited |
| Tool call | Read-only queries only |
| Output | AICandidate — never direct write |
| Approval | Human gate before UED mutates |

---

## Execution result

```json
{
  "success": true,
  "executionId": "uuid",
  "traceId": "uuid",
  "data": {},
  "events": ["record.updated"],
  "errors": []
}
```

---

*End of document.*
