/** Studio Project Model — Project as official Studio unit (Program 2.2.5) */

export const STUDIO_PROJECT_VERSION = "mak-studio-project-v1";

/**
 * @typedef {object} StudioProjectArtifact
 * @property {string} artifactId
 * @property {string} artifactType — layout | field | workflow | dashboard | report | automation
 * @property {string} designerId
 * @property {object} document
 * @property {object} [metadata]
 */

/**
 * @param {object} partial
 */
export function createStudioProject(partial = {}) {
  const artifacts = partial.artifacts ?? [];
  return Object.freeze({
    projectVersion: STUDIO_PROJECT_VERSION,
    projectId: partial.projectId ?? `project-${partial.moduleId ?? "default"}`,
    moduleId: partial.moduleId ?? "empresas",
    tenantId: partial.tenantId ?? null,
    label: partial.label ?? partial.moduleId ?? "Studio Project",
    activeDesignerId: partial.activeDesignerId ?? null,
    activeArtifactId: partial.activeArtifactId ?? null,
    artifacts: Object.freeze(artifacts.map((a) => Object.freeze({ ...a }))),
    metadata: Object.freeze({ ...(partial.metadata ?? {}) }),
    createdAt: partial.createdAt ?? new Date().toISOString(),
    updatedAt: partial.updatedAt ?? new Date().toISOString(),
  });
}

export function createProjectModel() {
  /** @type {ReturnType<typeof createStudioProject>|null} */
  let project = null;

  const load = (nextProject) => {
    project = createStudioProject(nextProject);
    return project;
  };

  const getArtifact = (artifactId) => project?.artifacts?.find((a) => a.artifactId === artifactId) ?? null;

  const listArtifacts = (artifactType = null) => {
    const list = project?.artifacts ?? [];
    return artifactType ? list.filter((a) => a.artifactType === artifactType) : list;
  };

  const upsertArtifact = (artifact) => {
    if (!project) throw new Error("Project not loaded.");
    const artifacts = [...project.artifacts];
    const idx = artifacts.findIndex((a) => a.artifactId === artifact.artifactId);
    const entry = Object.freeze({ ...artifact });
    if (idx >= 0) artifacts[idx] = entry;
    else artifacts.push(entry);
    project = createStudioProject({
      ...project,
      artifacts,
      updatedAt: new Date().toISOString(),
    });
    return entry;
  };

  const setActive = ({ designerId, artifactId }) => {
    if (!project) throw new Error("Project not loaded.");
    project = createStudioProject({
      ...project,
      activeDesignerId: designerId ?? project.activeDesignerId,
      activeArtifactId: artifactId ?? project.activeArtifactId,
      updatedAt: new Date().toISOString(),
    });
    return project;
  };

  return Object.freeze({
    version: STUDIO_PROJECT_VERSION,
    load,
    get: () => project,
    getArtifact,
    listArtifacts,
    upsertArtifact,
    setActive,
  });
}

export default createProjectModel;
