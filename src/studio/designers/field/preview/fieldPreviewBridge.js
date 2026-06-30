import { documentToAst, documentToRegistryPayloads } from "../core/fieldCoreSetup.js";
import { mdpCompile } from "@/studio/services/mdpStudioClient.js";
import { mdpRegistrySyncLayoutEntries } from "@/studio/services/mdpRegistryClient.js";
import { normalizeIntrospectToPreviewCrb } from "@/studio/services/previewCrbAdapter.js";

/** Preview: Field Document → AST → field_config registry → Compile → CRB */
export async function compileFieldDocumentPreview(document, options = {}) {
  const ast = documentToAst(document);
  const registryPayloads = documentToRegistryPayloads(document);
  const moduleId = document.moduleId ?? "empresas";

  await mdpRegistrySyncLayoutEntries(registryPayloads).catch(() => {});

  const compileResult = await mdpCompile(moduleId, {
    draft: true,
    fieldDocument: {
      documentId: document.documentId,
      astVersion: ast.astVersion,
      entityId: document.entityId,
    },
    ...options,
  });

  const crb = normalizeIntrospectToPreviewCrb(compileResult) ?? {
    crbVersion: compileResult?.crbVersion ?? "mdp-crb-v1",
    moduleId: compileResult?.moduleId ?? moduleId,
    versionId: compileResult?.versionId ?? null,
    source: "mdp-compile-field-document",
  };

  const activeFields = (document.groups ?? []).flatMap((g) =>
    (g.fields ?? []).filter((f) => !f._pendingDelete)
  );

  return {
    ok: Boolean(compileResult?.moduleId ?? compileResult?.versionId ?? crb.versionId),
    compileId: crb.versionId,
    crb,
    ast,
    message: crb.versionId
      ? `Preview CRB · ${crb.versionId} · ${activeFields.length} campo(s)`
      : `Preview · ${activeFields.length} campo(s)`,
  };
}

export default compileFieldDocumentPreview;
