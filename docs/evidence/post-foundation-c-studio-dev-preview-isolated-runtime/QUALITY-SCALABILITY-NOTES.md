# Quality & Scalability Notes

- Pure, deterministic composer: same implementation plan → same object graph and FNV-1a digests.
- Granular parts (session / preflight / loader / synthetic-data / placeholder-resolver / virtual-frame /
  lifecycle / event-dispatcher / render-request / state / permission / data / isolation / manual-gate /
  safety / manifest / verifier / compatibility / diagnostics / fallback) — each independently testable.
- Fail-closed: invalid/missing/fallback plan OR failed preflight → safe fallback; verifier never throws.
- Zero new dependencies; React-free; no I/O; synthetic data only.
- The virtual preview frame is a stable, auditable JSON artifact that a future UI-runtime slice can
  bind against — without this slice ever touching a real UI surface.
