import { REGISTRY_TYPE_MAP } from "./mmmPublishConstants.js";

const pushRegistry = (registries, bucket, moduleId, envelope) => {
  if (!registries[bucket][moduleId]) registries[bucket][moduleId] = [];
  registries[bucket][moduleId].push({
    objectId: envelope.objectId,
    objectType: envelope.objectType,
    code: envelope.payload?.code,
    payload: envelope.payload,
    labels: envelope.labels,
  });
};

const compileRoutes = (envelopes) => {
  const routes = [];
  const paths = new Set();
  for (const envelope of envelopes) {
    const routePath = envelope.payload?.routePath || envelope.payload?.path;
    if (!routePath) continue;
    if (paths.has(routePath)) {
      throw new Error(`Duplicate route path '${routePath}' (C-10)`);
    }
    paths.add(routePath);
    routes.push({
      objectId: envelope.objectId,
      path: routePath,
      moduleId: envelope.scope?.moduleId,
      objectType: envelope.objectType,
    });
  }
  return routes;
};

export const compileRegistries = (envelopes) => {
  const registries = {
    layout: {},
    field: {},
    validation: {},
    formula: {},
    event: {},
    action: {},
    workflow: {},
    permission: {},
    baseTemplate: {},
  };

  for (const envelope of envelopes) {
    const bucket = REGISTRY_TYPE_MAP[envelope.objectType];
    const moduleId = envelope.scope?.moduleId ?? "all";
    if (bucket) pushRegistry(registries, bucket, moduleId, envelope);
  }

  const routes = compileRoutes(envelopes);
  const menu = envelopes
    .filter((item) => item.objectType === "menu" || item.payload?.menuEntry)
    .map((item) => ({
      objectId: item.objectId,
      label: item.labels?.[0]?.label,
      routePath: item.payload?.routePath,
    }));

  return { registries, routes, menu };
};

export const assembleCrb = ({
  tenantId,
  moduleId,
  baseTemplateId,
  definitionVersionId,
  semver,
  revision,
  normalized,
  registries,
  routes,
  menu,
  contentHash,
  integrityHash,
  signatureRef,
  compiledBy,
}) => ({
  crbVersion: "mmm-crb-v1",
  bundleId: null,
  definitionVersionId,
  tenantId,
  moduleId,
  baseTemplateId,
  contentHash,
  integrityHash,
  compiledAt: new Date().toISOString(),
  clientTargets: ["web"],
  registries,
  route: routes,
  menu,
  objects: normalized.envelopes,
  capabilities: {
    engines: ["V13", "V14", "V16", "V17", "V18", "V19", "V20"],
    views: normalized.envelopes.filter((item) => item.objectType === "view").map((item) => item.objectId),
    integrations: normalized.envelopes
      .filter((item) => item.objectType === "integration")
      .map((item) => item.objectId),
  },
  metadata: {
    objectCount: normalized.objectCount,
    fieldCount: normalized.fieldCount,
    screenCount: normalized.screenCount,
    compiledBy,
    sourceRevision: revision,
    semver,
  },
  signatureRef,
});
