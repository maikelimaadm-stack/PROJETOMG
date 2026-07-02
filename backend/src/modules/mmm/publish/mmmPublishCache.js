import { tieredCache } from "../../../cache/tieredCache.js";

export const invalidatePublishCache = async ({ tenantId, moduleId, environment }) => {
  const prefixes = [
    `mmm:crb:${tenantId}:${moduleId}:`,
    `mmm:publish:${tenantId}:`,
    `auth:scope:`,
  ];
  if (environment) prefixes.push(`mmm:pin:${tenantId}:${moduleId}:${environment}:`);

  await Promise.all(prefixes.map((prefix) => tieredCache.invalidatePrefix(prefix)));

  return {
    invalidatedPrefixes: prefixes,
    environment: environment ?? null,
    completedAt: new Date().toISOString(),
  };
};
