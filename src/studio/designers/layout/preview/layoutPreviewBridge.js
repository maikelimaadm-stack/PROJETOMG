import { documentToAst } from "../document/documentToAst.js";
import { astToRegistryPayloads } from "../ast/astToMdpPayloads.js";
import { mdpCompile } from "@/studio/services/mdpStudioClient.js";
import { normalizeIntrospectToPreviewCrb } from "@/studio/services/previewCrbAdapter.js";

/**
 * Preview pipeline: Layout Document → AST → Registry → Compile → CRB
 * Read-only — never mutates Runtime Bridge state directly.
 */
export async function compileLayoutDocumentPreview(document, options = {}) {
  const ast = documentToAst(document);
  const registryPayloads = astToRegistryPayloads(ast);
  const moduleId = document.moduleId ?? "empresas";

  const compileResult = await mdpCompile(moduleId, {
    draft: true,
    layoutDocument: {
      documentId: document.documentId,
      astVersion: ast.astVersion,
      registryEntries: registryPayloads,
    },
    ...options,
  });

  const crb = normalizeIntrospectToPreviewCrb(compileResult) ?? {
    crbVersion: compileResult?.crbVersion ?? "mdp-crb-v1",
    moduleId: compileResult?.moduleId ?? moduleId,
    versionId: compileResult?.versionId ?? null,
    source: "mdp-compile-layout-document",
  };

  return {
    ok: Boolean(compileResult?.moduleId ?? compileResult?.versionId ?? crb.versionId),
    compileId: crb.versionId,
    crb,
    ast,
    registryPayloads,
    message: crb.versionId
      ? `Preview CRB · ${crb.versionId} · ${registryPayloads.length} entradas`
      : "Compile concluído",
  };
}

export default compileLayoutDocumentPreview;
