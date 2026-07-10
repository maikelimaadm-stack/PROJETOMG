import React from "react";

/**
 * Discreet, presentational badge shown when the beta read model is applied and
 * writes are blocked. Read-only, no side effects, no CSS global (inline utility
 * classes only, matching the existing beta banner). Renders nothing when writes
 * are not blocked.
 *
 * @param {Object} props
 * @param {boolean} props.writeBlocked
 * @param {string} [props.message]
 */
function ModeloBase1RuntimeReadWriteBlockedBadge({ writeBlocked, message }) {
  if (!writeBlocked) return null;
  return (
    <span
      data-mb1-runtime-read-badge="write-blocked"
      className="inline-flex items-center gap-1 rounded bg-sky-100 px-1.5 py-0.5 text-[11px] font-medium text-sky-800"
      title={message || "Modo beta somente leitura: gravação desabilitada."}
    >
      🔒 leitura beta
    </span>
  );
}

export default ModeloBase1RuntimeReadWriteBlockedBadge;
