/**
 * Metadata declarativa da Tela Mãe MAK (regiões visuais).
 */
import { MAK_MOTHER_PAGE_DEFAULT_METADATA } from "@/framework/mak/page/makMotherPage.constants.js";

export function buildMakPageMetadata(overrides = {}) {
  return {
    ...MAK_MOTHER_PAGE_DEFAULT_METADATA,
    ...overrides,
  };
}
