export function explainSegmentationProfile(profile) {
  return Object.freeze({
    id: profile.profileId,
    segment: profile.segmentLabel,
    because: profile.summary,
    evidenceCount: profile.evidenceRefs?.length ?? 0,
    individualProfilingForbidden: profile.individualProfilingForbidden !== false,
    traceable: (profile.lineage?.length ?? 0) > 0,
  });
}

export function explainTemplateMatch(match) {
  return Object.freeze({
    id: match.matchId,
    templateLabel: match.templateLabel,
    compatibilityScore: match.compatibilityScore,
    because: match.because ?? match.summary,
  });
}

export default { explainSegmentationProfile, explainTemplateMatch };
