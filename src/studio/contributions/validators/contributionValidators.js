import { validateContributionMetadata } from "../contracts/contributionContracts.js";
import { validateContributionPayload } from "../contracts/contributionTypeContracts.js";

export function validateContributionEntry(entry) {
  const errors = [];
  const meta = validateContributionMetadata(entry);
  if (!meta.valid) errors.push(...meta.errors);
  const payload = validateContributionPayload(entry.type, entry.payload ?? entry);
  if (!payload.valid) errors.push(...payload.errors);
  if (entry.dependencies?.length) {
    entry.dependencies.forEach((dep) => {
      if (typeof dep !== "string") errors.push("dependencies must be strings.");
    });
  }
  return { valid: errors.length === 0, errors };
}

export function validateContributorId(contributorId) {
  if (!contributorId || typeof contributorId !== "string") {
    return { valid: false, errors: ["contributorId must be a non-empty string."] };
  }
  if (contributorId.includes("..") || contributorId.includes("/")) {
    return { valid: false, errors: ["contributorId must not contain path segments."] };
  }
  return { valid: true, errors: [] };
}

export function validateNoDirectRegistryAccess(sourcePath) {
  const forbidden = [
    "/registry/componentRegistry",
    "/registry/propertyRegistry",
    "/registry/actionRegistry",
    "/registry/designerRegistry",
  ];
  const hit = forbidden.find((p) => sourcePath.includes(p));
  if (hit) {
    return { valid: false, errors: [`Direct registry access forbidden: ${hit}`] };
  }
  return { valid: true, errors: [] };
}

export default validateContributionEntry;
