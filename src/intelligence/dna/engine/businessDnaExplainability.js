export function explainDnaProfile(profile) {
  return Object.freeze({
    id: profile.profileId,
    title: profile.title,
    because: profile.summary,
    identity: profile.identityStatement,
    maturityLevel: profile.maturityLevel,
    evidenceCount: profile.evidenceRefs?.length ?? 0,
    individualProfilingForbidden: profile.individualProfilingForbidden !== false,
    traceable: (profile.lineage?.length ?? 0) > 0,
  });
}

export function explainDnaFingerprint(fingerprint) {
  return Object.freeze({
    id: fingerprint.fingerprintId,
    label: fingerprint.label,
    traitCount: fingerprint.traits?.length ?? 0,
    traits: fingerprint.traits,
  });
}

export default { explainDnaProfile, explainDnaFingerprint };
