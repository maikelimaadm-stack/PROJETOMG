/**
 * Runtime Bridge — sole entry point for Foundation runtime hydration (Program 1E).
 */
import "@/modules/makBootstrap/registerMakFoundationEngines.js";
import { bootstrapRuntimeBridge } from "@/modules/makBootstrap/runtimeBridge/runtimeBridge.js";

bootstrapRuntimeBridge();

export {
  bootstrapRuntimeBridge,
  reloadRuntimeBridgeModule,
  getRuntimeBridgeStatus,
  isRuntimeBridgeHydrated,
} from "@/modules/makBootstrap/runtimeBridge/runtimeBridge.js";
