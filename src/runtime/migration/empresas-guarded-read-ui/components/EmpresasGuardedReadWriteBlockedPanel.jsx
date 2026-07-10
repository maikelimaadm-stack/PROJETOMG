/**
 * Dev-only, READ-ONLY presentational panel that makes it explicit that every
 * write operation is blocked in this slice. It lists the blocked operations and
 * (optionally) their block code by probing the read-only write guard passively —
 * the guard's `attempt()` only ever RETURNS a structured blocked result, it
 * never performs anything. Pure props → markup; no side effects.
 *
 * @param {Object} props
 * @param {string[]} [props.blockedOperations]
 * @param {import('../../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyWriteGuard} [props.writeGuard]
 */
export function EmpresasGuardedReadWriteBlockedPanel({ blockedOperations, writeGuard }) {
  const ops = Array.isArray(blockedOperations) ? blockedOperations : [];
  const canProbe = writeGuard && typeof writeGuard.attempt === 'function';
  return (
    <section className="mak-guarded-read-write-blocked" data-testid="empresas-guarded-read-write-blocked" aria-readonly="true">
      <h3 className="text-sm font-semibold">Escrita bloqueada</h3>
      <p className="text-xs">Escrita no runtime v2 para Empresas é impossível neste slice.</p>
      <ul className="text-xs">
        {ops.map((op) => {
          // Passive probe — the guard only ever returns a blocked result, it executes nothing.
          const result = canProbe ? writeGuard.attempt(op) : null;
          return (
            <li key={op} data-operation={op} data-blocked="true">
              {op}
              {result ? ` — ${result.code}` : ' — bloqueada'}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default EmpresasGuardedReadWriteBlockedPanel;
