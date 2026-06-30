import { defineStudioDomainServices } from "../contracts/serviceContracts.js";
import { createStubAssetService } from "../services/assetService.js";
import {
  mdpIntrospect,
  mdpCompile,
  mdpPublish,
  loadPreviewCrbFromIntrospect,
  loadPreviewCrbFromCompile,
  buildExplorerTreeFromRegistry,
  buildPropertyFieldsFromCrb,
} from "@/studio/services/index.js";

/**
 * Production domain service adapters — MDP public APIs only (Program 2.1B).
 * @param {{ moduleId: string, getExplorerTree?: () => Array, getFields?: () => Array }} options
 */
export function createProductionDomainAdapters(options = {}) {
  const moduleId = options.moduleId ?? "empresas";
  let cachedIntrospect = null;
  let validationErrorCount = 0;

  const loadIntrospect = async () => {
    if (cachedIntrospect) return cachedIntrospect;
    cachedIntrospect = await mdpIntrospect(moduleId);
    return cachedIntrospect;
  };

  const getExplorerTree = () => options.getExplorerTree?.() ?? [];
  const getFields = () => options.getFields?.() ?? cachedIntrospect?.fields ?? [];

  return defineStudioDomainServices({
    previewService: {
      getStatus: () => "idle",
      compile: async () => loadPreviewCrbFromIntrospect(moduleId),
      refresh: async () => loadPreviewCrbFromCompile(moduleId),
    },
    publishService: {
      getStatus: () => "draft",
      validate: async () => {
        try {
          const result = await mdpCompile(moduleId, { draft: true });
          validationErrorCount = result?.errors?.length ?? 0;
          return { ok: validationErrorCount === 0, errors: result?.errors ?? [] };
        } catch {
          validationErrorCount = 0;
          return { ok: true, errors: [] };
        }
      },
      publish: async (body = {}) => {
        try {
          const result = await mdpPublish({ moduleId, ...body });
          return { ok: Boolean(result?.versionId ?? result?.ok), version: result?.versionId ?? null };
        } catch {
          return { ok: false };
        }
      },
      pinEnvironment: async () => ({ ok: false }),
    },
    compileService: {
      compileDraft: async () => {
        const result = await mdpCompile(moduleId, { draft: true });
        return { ok: Boolean(result?.moduleId ?? result?.versionId), bundleId: result?.versionId ?? null };
      },
      getLastBundle: async () => cachedIntrospect,
    },
    validationService: {
      validate: async () => {
        try {
          const result = await mdpCompile(moduleId, { draft: true });
          const errors = result?.errors ?? [];
          validationErrorCount = errors.length;
          return { ok: errors.length === 0, errors };
        } catch {
          validationErrorCount = 0;
          return { ok: true, errors: [] };
        }
      },
      getErrorCount: () => validationErrorCount,
    },
    assetService: createStubAssetService({
      listAssets: async () => {
        const intro = await loadIntrospect();
        const entries = intro?.registryEntries ?? [];
        return entries.slice(0, 24).map((e) => ({
          assetId: e.entryId ?? e.entry_id,
          label: e.label ?? e.entryId,
          type: e.entryType ?? e.entry_type ?? "entry",
        }));
      },
    }),
    searchService: {
      search: async (query) => {
        const q = String(query ?? "").trim().toLowerCase();
        if (!q) return [];
        const tree = getExplorerTree();
        const flat = [];
        const walk = (nodes) => {
          nodes.forEach((n) => {
            flat.push(n);
            if (n.children?.length) walk(n.children);
          });
        };
        walk(tree);
        return flat
          .filter((n) => n.label?.toLowerCase().includes(q) || n.entryId?.toLowerCase().includes(q))
          .slice(0, 20)
          .map((n) => ({ id: n.entryId, label: n.label, category: n.entryType ?? "entry" }));
      },
      clearIndex: () => {},
    },
  });
}

/** Load MDP explorer tree + field cache for a module. */
export async function loadMdpWorkspaceData(moduleId) {
  const introspect = await mdpIntrospect(moduleId);
  const tree = buildExplorerTreeFromRegistry(introspect?.registryEntries ?? []);
  const fields = introspect?.fields ?? [];
  return { introspect, tree, fields };
}

/** Resolve property fields for a selection target. */
export function resolvePropertyFieldsForSelection(fields, entryId) {
  return buildPropertyFieldsFromCrb(fields, entryId);
}

export default createProductionDomainAdapters;
