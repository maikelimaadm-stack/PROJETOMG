/** Official Studio Domain service contracts — interfaces only (Program 2.1A.6) */

/**
 * @typedef {object} PreviewServiceContract
 * @property {() => string} getStatus
 * @property {() => Promise<{ ok: boolean, compileId?: string, reason?: string }>} compile
 * @property {() => void} refresh
 */

/**
 * @typedef {object} PublishServiceContract
 * @property {() => string} getStatus
 * @property {() => Promise<{ ok: boolean, version?: string, errors?: string[] }>} validate
 * @property {() => Promise<{ ok: boolean, version?: string }>} publish
 * @property {(env: string) => Promise<{ ok: boolean }>} pinEnvironment
 */

/**
 * @typedef {object} CompileServiceContract
 * @property {() => Promise<{ ok: boolean, bundleId?: string }>} compileDraft
 * @property {() => Promise<object|null>} getLastBundle
 */

/**
 * @typedef {object} ValidationServiceContract
 * @property {() => Promise<{ ok: boolean, errors: Array<{ code: string, message: string }> }>} validate
 * @property {() => number} getErrorCount
 */

/**
 * @typedef {object} AssetServiceContract
 * @property {() => Promise<Array<{ assetId: string, label: string, type: string }>>} listAssets
 * @property {(assetId: string) => Promise<object|null>} getAsset
 */

/**
 * @typedef {object} SearchServiceContract
 * @property {(query: string) => Promise<Array<{ id: string, label: string, category: string }>>} search
 * @property {() => void} clearIndex
 */

/**
 * @typedef {object} StudioDomainServices
 * @property {PreviewServiceContract} previewService
 * @property {PublishServiceContract} publishService
 * @property {CompileServiceContract} compileService
 * @property {ValidationServiceContract} validationService
 * @property {AssetServiceContract} assetService
 * @property {SearchServiceContract} searchService
 */

export function definePreviewService(impl) {
  return Object.freeze({
    getStatus: impl.getStatus ?? (() => "idle"),
    compile: impl.compile ?? (async () => ({ ok: false, reason: "not-implemented" })),
    refresh: impl.refresh ?? (() => {}),
  });
}

export function definePublishService(impl) {
  return Object.freeze({
    getStatus: impl.getStatus ?? (() => "draft"),
    validate: impl.validate ?? (async () => ({ ok: true, errors: [] })),
    publish: impl.publish ?? (async () => ({ ok: false })),
    pinEnvironment: impl.pinEnvironment ?? (async () => ({ ok: false })),
  });
}

export function defineCompileService(impl) {
  return Object.freeze({
    compileDraft: impl.compileDraft ?? (async () => ({ ok: false })),
    getLastBundle: impl.getLastBundle ?? (async () => null),
  });
}

export function defineValidationService(impl) {
  return Object.freeze({
    validate: impl.validate ?? (async () => ({ ok: true, errors: [] })),
    getErrorCount: impl.getErrorCount ?? (() => 0),
  });
}

export function defineAssetService(impl) {
  return Object.freeze({
    listAssets: impl.listAssets ?? (async () => []),
    getAsset: impl.getAsset ?? (async () => null),
  });
}

export function defineSearchService(impl) {
  return Object.freeze({
    search: impl.search ?? (async () => []),
    clearIndex: impl.clearIndex ?? (() => {}),
  });
}

export function defineStudioDomainServices(partial = {}) {
  return Object.freeze({
    previewService: definePreviewService(partial.previewService ?? {}),
    publishService: definePublishService(partial.publishService ?? {}),
    compileService: defineCompileService(partial.compileService ?? {}),
    validationService: defineValidationService(partial.validationService ?? {}),
    assetService: defineAssetService(partial.assetService ?? {}),
    searchService: defineSearchService(partial.searchService ?? {}),
  });
}
