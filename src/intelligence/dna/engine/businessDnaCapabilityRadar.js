/** Capability radar for BOS — organizational domains only */
export function buildCapabilityRadar(maturity) {
  return Object.freeze(
    maturity.capabilities.map((c) =>
      Object.freeze({
        id: c.domainId,
        label: c.label,
        level: c.level,
        score: c.score,
        maxScore: 3,
      })
    )
  );
}

export default buildCapabilityRadar;
