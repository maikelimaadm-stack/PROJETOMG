/** Refactoring Engine — safe renames and structural changes (Program 2.2.5) */

export const REFACTORING_ENGINE_VERSION = "mak-refactoring-engine-v1";

export function createRefactoringEngine(deps = {}) {
  const { projectModel, dependencyGraph } = deps;

  const renameArtifact = ({ artifactId, newArtifactId, updateDocument }) => {
    if (!projectModel) throw new Error("Refactoring engine requires project model.");
    const artifact = projectModel.getArtifact(artifactId);
    if (!artifact) throw new Error(`Artifact not found: ${artifactId}`);

    const dependents = dependencyGraph?.getDependents(artifactId) ?? [];
    const plan = {
      type: "rename",
      artifactId,
      newArtifactId,
      affectedDependents: dependents.map((d) => d.to),
    };

    const updatedDocument = updateDocument
      ? updateDocument(artifact.document, { oldId: artifactId, newId: newArtifactId })
      : { ...artifact.document, documentId: newArtifactId };

    projectModel.upsertArtifact({
      ...artifact,
      artifactId: newArtifactId,
      document: updatedDocument,
    });

    dependencyGraph?.removeNode(artifactId);
    dependencyGraph?.addNode({ id: newArtifactId, type: artifact.artifactType, label: newArtifactId });
    dependents.forEach((dep) => {
      dependencyGraph?.addEdge({ from: newArtifactId, to: dep.to, kind: dep.kind });
    });

    return Object.freeze({ ok: true, plan });
  };

  const renameBinding = ({ document, oldTargetId, newTargetId, patchDocument }) => {
    if (typeof patchDocument !== "function") {
      throw new Error("renameBinding requires patchDocument function.");
    }
    const next = patchDocument(document, { oldTargetId, newTargetId });
    return Object.freeze({ ok: true, document: next });
  };

  const applyPlan = (plan) => Object.freeze({ ok: true, applied: plan.type, plan });

  return Object.freeze({
    version: REFACTORING_ENGINE_VERSION,
    renameArtifact,
    renameBinding,
    applyPlan,
  });
}

export default createRefactoringEngine;
