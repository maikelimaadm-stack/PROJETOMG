/** MAK Studio Contribution Engine — official contracts (Program 2.1A.7) */

export const STUDIO_CONTRIBUTIONS_VERSION = "mak-studio-contributions-v1";

export const CONTRIBUTION_LIFECYCLE_STATES = Object.freeze([
  "registered",
  "enabled",
  "disabled",
  "unloaded",
]);

export const OFFICIAL_CONTRIBUTION_TYPES = Object.freeze([
  "explorer",
  "toolbar",
  "inspector",
  "command",
  "contextMenu",
  "dock",
  "property",
]);

export const OFFICIAL_REGISTRY_IDS = Object.freeze([
  "components",
  "properties",
  "events",
  "actions",
  "capabilities",
  "designers",
]);

/**
 * @typedef {object} ContributionMetadata
 * @property {string} contributionId
 * @property {string} contributorId — designerId or packageId
 * @property {string} type — one of OFFICIAL_CONTRIBUTION_TYPES
 * @property {string} version
 * @property {string[]} [capabilities]
 * @property {string[]} [dependencies]
 * @property {boolean} enabled
 * @property {string} lifecycleState
 */

/**
 * @typedef {object} MakPackageManifest
 * @property {string} packageId
 * @property {string} version
 * @property {string} [publisher]
 * @property {Array<{ type: string, contribution: object }>} contributions
 */

export function validateContributionMetadata(meta) {
  const errors = [];
  if (!meta?.contributionId) errors.push("contributionId is required.");
  if (!meta?.contributorId) errors.push("contributorId is required.");
  if (!OFFICIAL_CONTRIBUTION_TYPES.includes(meta?.type)) {
    errors.push(`Invalid contribution type: ${meta?.type}`);
  }
  if (!meta?.version) errors.push("version is required.");
  return { valid: errors.length === 0, errors };
}

export function validateMakPackageManifest(manifest) {
  const errors = [];
  if (!manifest?.packageId) errors.push("packageId is required.");
  if (!manifest?.version) errors.push("version is required.");
  if (!Array.isArray(manifest?.contributions)) {
    errors.push("contributions array is required.");
  } else {
    manifest.contributions.forEach((entry, i) => {
      if (!OFFICIAL_CONTRIBUTION_TYPES.includes(entry?.type)) {
        errors.push(`contributions[${i}]: invalid type ${entry?.type}`);
      }
    });
  }
  return { valid: errors.length === 0, errors };
}
