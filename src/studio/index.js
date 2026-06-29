/**
 * MAK Studio — SDK + Design System + Registry Foundation
 * Layer order: SDK → Design System → Shell (Phase 2.1) → Designers
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
export {
  DESIGN_SYSTEM_VERSION,
  bootstrapDesignSystem,
  getDesignSystemSnapshot,
  getDesignToken,
  listDesignTokens,
  resolveTokenValue,
  getDesignTheme,
  listDesignThemes,
  getDesignMotion,
  getComponentManifest,
  getUniversalComponent,
  listUniversalComponents,
  validateComponentManifest,
  validateUniversalComponent,
} from "./designSystem/index.js";

import { bootstrapStudioRegistries } from "./registry/bootstrapStudioRegistries.js";
import { bootstrapDesignSystem } from "./designSystem/bootstrapDesignSystem.js";

bootstrapStudioRegistries();
bootstrapDesignSystem();
