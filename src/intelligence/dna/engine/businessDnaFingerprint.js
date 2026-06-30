import { createDnaFingerprint, upsertDnaFingerprint } from "./businessDnaStore.js";
import { appendDnaAuditEntry } from "./businessDnaAuditTrail.js";

/** Organizational fingerprint — never individual profiling */
export function buildBusinessDnaFingerprint(ctx, maturity) {
  const traits = maturity.capabilities.map((c) =>
    Object.freeze({
      id: c.domainId,
      label: `${c.label}: ${c.level}`,
      because: `Maturidade observada no domínio ${c.label}.`,
    })
  );

  if ((ctx.timeline?.eventCount ?? 0) >= 2) {
    traits.push(
      Object.freeze({
        id: "evolution-activity",
        label: "Evolução ativa",
        because: "Histórico operacional mostra evolução registrada ao longo do tempo.",
      })
    );
  }

  const fingerprint = createDnaFingerprint({
    tenantId: ctx.tenantId,
    label: "Fingerprint operacional organizacional",
    traits,
  });
  upsertDnaFingerprint(fingerprint);
  appendDnaAuditEntry({
    tenantId: ctx.tenantId,
    action: "fingerprint_created",
    entityId: fingerprint.fingerprintId,
    entityType: "fingerprint",
  });
  return fingerprint;
}

export default buildBusinessDnaFingerprint;
