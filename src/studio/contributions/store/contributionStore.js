/** In-memory contribution store (Program 2.1A.7) */

const contributions = new Map();

export function getContributionStore() {
  return contributions;
}

export function registerContributionEntry(entry) {
  contributions.set(entry.contributionId, Object.freeze({ ...entry }));
  return entry;
}

export function getContribution(contributionId) {
  return contributions.get(contributionId) ?? null;
}

export function listContributions(filter = {}) {
  let result = [...contributions.values()];
  if (filter.type) result = result.filter((c) => c.type === filter.type);
  if (filter.contributorId) result = result.filter((c) => c.contributorId === filter.contributorId);
  if (filter.enabled != null) result = result.filter((c) => c.enabled === filter.enabled);
  return result;
}

export function deleteContribution(contributionId) {
  return contributions.delete(contributionId);
}

export function clearContributionStore() {
  contributions.clear();
}

export function getContributionCount() {
  return contributions.size;
}

/** @deprecated use getContributionStore */
export const getContributionRegistry = getContributionStore;
