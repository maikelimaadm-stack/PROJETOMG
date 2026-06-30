/** Studio Package Model — Projects, Packages, Modules, Objects (Program 2.2.6) */

export const STUDIO_PACKAGE_VERSION = "mak-som-package-v1";

/**
 * @typedef {object} StudioPackageObject
 * @property {string} objectId
 * @property {string} kind
 * @property {object} [document]
 * @property {object} [metadata]
 */

export function createStudioPackage(partial = {}) {
  const modules = partial.modules ?? [];
  return Object.freeze({
    packageVersion: STUDIO_PACKAGE_VERSION,
    packageId: partial.packageId ?? `pkg-${partial.moduleId ?? "default"}`,
    projectId: partial.projectId ?? null,
    moduleId: partial.moduleId ?? "empresas",
    label: partial.label ?? partial.moduleId ?? "Studio Package",
    modules: Object.freeze(
      modules.map((m) =>
        Object.freeze({
          moduleId: m.moduleId,
          label: m.label ?? m.moduleId,
          objects: Object.freeze((m.objects ?? []).map((o) => Object.freeze({ ...o }))),
          metadata: Object.freeze({ ...(m.metadata ?? {}) }),
        })
      )
    ),
    metadata: Object.freeze({ ...(partial.metadata ?? {}) }),
    createdAt: partial.createdAt ?? new Date().toISOString(),
    updatedAt: partial.updatedAt ?? new Date().toISOString(),
  });
}

export function createPackageModel() {
  /** @type {ReturnType<typeof createStudioPackage>|null} */
  let pkg = null;

  const load = (nextPackage) => {
    pkg = createStudioPackage(nextPackage);
    return pkg;
  };

  const fromProject = ({ project, moduleId, artifacts = [] }) => {
    const objects = artifacts.map((a) =>
      Object.freeze({
        objectId: a.artifactId ?? a.objectId,
        kind: a.artifactType ?? a.kind ?? "artifact",
        document: a.document ?? null,
        metadata: Object.freeze({ designerId: a.designerId ?? null, ...(a.metadata ?? {}) }),
      })
    );
    return load(
      createStudioPackage({
        packageId: `pkg-${project?.projectId ?? moduleId}`,
        projectId: project?.projectId ?? `project-${moduleId}`,
        moduleId: moduleId ?? project?.moduleId ?? "empresas",
        label: project?.label ?? moduleId,
        modules: [{ moduleId: moduleId ?? project?.moduleId, objects }],
        metadata: { source: "project", projectVersion: project?.projectVersion ?? null },
      })
    );
  };

  const getModule = (moduleId) => pkg?.modules?.find((m) => m.moduleId === moduleId) ?? null;

  const listObjects = (moduleId, kind = null) => {
    const mod = getModule(moduleId);
    const list = mod?.objects ?? [];
    return kind ? list.filter((o) => o.kind === kind) : list;
  };

  const upsertObject = (moduleId, object) => {
    if (!pkg) throw new Error("Package not loaded.");
    const modules = pkg.modules.map((m) => {
      if (m.moduleId !== moduleId) return m;
      const objects = [...m.objects];
      const idx = objects.findIndex((o) => o.objectId === object.objectId);
      const entry = Object.freeze({ ...object });
      if (idx >= 0) objects[idx] = entry;
      else objects.push(entry);
      return Object.freeze({ ...m, objects: Object.freeze(objects) });
    });
    pkg = createStudioPackage({ ...pkg, modules, updatedAt: new Date().toISOString() });
    return object;
  };

  const serialize = () => JSON.stringify(pkg);
  const deserialize = (json) => {
    const parsed = typeof json === "string" ? JSON.parse(json) : json;
    return load(parsed);
  };

  const exportSnapshot = () =>
    Object.freeze({
      version: STUDIO_PACKAGE_VERSION,
      package: pkg,
      exportedAt: new Date().toISOString(),
    });

  return Object.freeze({
    version: STUDIO_PACKAGE_VERSION,
    load,
    fromProject,
    get: () => pkg,
    getModule,
    listObjects,
    upsertObject,
    serialize,
    deserialize,
    exportSnapshot,
  });
}

export default createPackageModel;
