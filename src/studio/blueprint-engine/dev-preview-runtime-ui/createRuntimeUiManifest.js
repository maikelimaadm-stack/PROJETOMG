import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_UI_NAME,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  RUNTIME_UI_CAPABILITIES,
  runtimeUiDigest,
} from './runtimeUiConfig.js';
import { createRuntimeUiSession } from './createRuntimeUiSession.js';
import { createRuntimeUiPreflight } from './createRuntimeUiPreflight.js';
import { createRuntimeUiContractLoader } from './createRuntimeUiContractLoader.js';
import { createRuntimeUiVirtualFrameInput } from './createRuntimeUiVirtualFrameInput.js';
import { createRuntimeUiComponentRegistry } from './createRuntimeUiComponentRegistry.js';
import { createRuntimeUiInteractionRegistry } from './createRuntimeUiInteractionRegistry.js';
import { createRuntimeUiStateProjection } from './createRuntimeUiStateProjection.js';
import { createRuntimeUiAccessibilityProjection } from './createRuntimeUiAccessibilityProjection.js';
import { createRuntimeUiThemeProjection } from './createRuntimeUiThemeProjection.js';
import { createRuntimeUiBlockedActionModel } from './createRuntimeUiBlockedActionModel.js';
import { createRuntimeUiReactTree } from './createRuntimeUiReactTree.js';
import { createRuntimeUiIsolationBoundary } from './createRuntimeUiIsolationBoundary.js';
import { createRuntimeUiDevFlagGate } from './createRuntimeUiDevFlagGate.js';

/**
 * Builds the runtime UI manifest with deterministic digests for every part. Pure — can build
 * standalone (parts recomputed) or from provided parts.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUiContract]
 * @param {Object} [options.parts]
 * @returns {Object}
 */
export function createRuntimeUiManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.runtimeUiContract) ? o.runtimeUiContract : {};
  const p = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const session = p.session ?? createRuntimeUiSession({ runtimeUiContract: c });
  const preflight = p.preflight ?? createRuntimeUiPreflight({ runtimeUiContract: c });
  const contractLoader = p.contractLoader ?? createRuntimeUiContractLoader({ runtimeUiContract: c });
  const virtualFrameInput = p.virtualFrameInput ?? createRuntimeUiVirtualFrameInput({ runtimeUiContract: c });
  const componentRegistry = p.componentRegistry ?? createRuntimeUiComponentRegistry();
  const interactionRegistry = p.interactionRegistry ?? createRuntimeUiInteractionRegistry();
  const stateProjection = p.stateProjection ?? createRuntimeUiStateProjection();
  const accessibilityProjection = p.accessibilityProjection ?? createRuntimeUiAccessibilityProjection();
  const themeProjection = p.themeProjection ?? createRuntimeUiThemeProjection();
  const blockedActionModel = p.blockedActionModel ?? createRuntimeUiBlockedActionModel();
  const reactTree = p.reactTree ?? createRuntimeUiReactTree({ runtimeUiContract: c });
  const isolationBoundary = p.isolationBoundary ?? createRuntimeUiIsolationBoundary();
  const devFlagGate = p.devFlagGate ?? createRuntimeUiDevFlagGate({ env: {} });

  const parts = {
    session: session.sessionDigest,
    preflight: preflight.preflightDigest,
    contractLoader: contractLoader.contractLoaderDigest,
    virtualFrameInput: virtualFrameInput.virtualFrameInputDigest,
    componentRegistry: componentRegistry.componentRegistryDigest,
    interactionRegistry: interactionRegistry.interactionRegistryDigest,
    stateProjection: stateProjection.stateProjectionDigest,
    accessibilityProjection: accessibilityProjection.accessibilityProjectionDigest,
    themeProjection: themeProjection.themeProjectionDigest,
    blockedActionModel: blockedActionModel.blockedActionModelDigest,
    reactTree: reactTree.reactTreeDigest,
    isolationBoundary: isolationBoundary.isolationBoundaryDigest,
    devFlagGate: devFlagGate.devFlagGateDigest,
  };

  const core = {
    kind: 'runtime-ui-manifest',
    runtimeUiName: RUNTIME_UI_NAME,
    runtimeUiVersion: RUNTIME_UI_VERSION,
    upstream: {
      runtimeUiContract: RUNTIME_UI_CONTRACT_VERSION,
      isolatedRuntime: ISOLATED_RUNTIME_VERSION,
    },
    parts,
    capabilities: { ...RUNTIME_UI_CAPABILITIES },
  };
  return safeCloneGenericModel({ ...core, manifestDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiManifest;
