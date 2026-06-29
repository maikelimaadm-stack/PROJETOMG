/**
 * MAK Studio — SDK & Registry Foundation (Program 2.0.5)
 * Official reusable infrastructure for all Studio designers.
 */
export { createStudioSdk, STUDIO_SDK_VERSION, validateStudioDesigner, validateStudioPlugin } from "./sdk/index.js";
export {
  bootstrapStudioRegistries,
  getStudioRegistrySnapshot,
  getStudioComponent,
  listStudioComponents,
  getStudioProperty,
  listStudioProperties,
  getStudioEvent,
  listStudioEvents,
  getStudioAction,
  listStudioActions,
  getStudioCapabilities,
  designerHasCapability,
} from "./registry/index.js";

import { bootstrapStudioRegistries } from "./registry/bootstrapStudioRegistries.js";

bootstrapStudioRegistries();
