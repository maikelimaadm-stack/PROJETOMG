export function createBusinessComputedVersioning(partial = {}) {
  const revision = partial.revision ?? 1;
  return Object.freeze({
    revision,
    contentHash: partial.contentHash ?? computeContentHash(partial.contentSeed ?? ""),
    schemaVersion: partial.schemaVersion,
    compatibilityVersion: partial.compatibilityVersion,
    previousRevision: partial.previousRevision ?? null,
    changeKind: partial.changeKind ?? "initial",
  });
}

function computeContentHash(seed) {
  const raw = String(seed);
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `bch-${hash.toString(16).padStart(8, "0")}`;
}

export function bumpBusinessComputedRevision(current, changeKind = "intent_change") {
  return createBusinessComputedVersioning({
    revision: (current?.revision ?? 0) + 1,
    contentSeed: `${current?.contentHash ?? ""}:${changeKind}`,
    schemaVersion: current?.schemaVersion,
    compatibilityVersion: current?.compatibilityVersion,
    previousRevision: current?.revision ?? null,
    changeKind,
  });
}

export default createBusinessComputedVersioning;
