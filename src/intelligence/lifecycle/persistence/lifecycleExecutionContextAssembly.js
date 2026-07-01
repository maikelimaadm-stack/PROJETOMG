import { assembleLifecycleContext } from "../engine/lifecycleContextAssembly.js";
import { retrieveLatestLifecycle } from "../engine/lifecycleRetrieval.js";

export function assembleLifecycleExecutionContext(groupId, tenantId = "default", options = {}) {
  const ctx = assembleLifecycleContext(groupId, tenantId, options);
  const lifecycle = retrieveLatestLifecycle(groupId);
  return Object.freeze({
    ...ctx,
    lifecycleSnapshot: lifecycle,
    executionReady: ctx.authorized === true,
    assembledAt: new Date().toISOString(),
  });
}

export default assembleLifecycleExecutionContext;
