export {
  registerStudioComponent,
  getStudioComponent,
  listStudioComponents,
  hasStudioComponent,
  getStudioComponentCount,
} from "./componentRegistry.js";
export {
  registerStudioProperty,
  getStudioProperty,
  listStudioProperties,
  hasStudioProperty,
  getStudioPropertyCount,
} from "./propertyRegistry.js";
export {
  registerStudioEvent,
  getStudioEvent,
  listStudioEvents,
  hasStudioEvent,
  getStudioEventCount,
} from "./eventRegistry.js";
export {
  registerStudioAction,
  getStudioAction,
  listStudioActions,
  hasStudioAction,
  getStudioActionCount,
} from "./actionRegistry.js";
export {
  registerStudioCapabilities,
  getStudioCapabilities,
  designerHasCapability,
  listStudioDesignerCapabilities,
} from "./capabilityRegistry.js";
export {
  registerStudioDesigner,
  getStudioDesigner,
  listStudioDesigners,
  hasStudioDesigner,
} from "./designerRegistry.js";
export {
  bootstrapStudioRegistries,
  isStudioRegistryBootstrapped,
  getStudioRegistrySnapshot,
} from "./bootstrapStudioRegistries.js";
