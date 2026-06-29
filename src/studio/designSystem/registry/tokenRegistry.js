import { TOKEN_CATEGORIES } from "../designSystemConstants.js";

const tokens = new Map();

/**
 * @param {string} tokenId
 * @param {object} definition
 */
export function registerDesignToken(tokenId, definition) {
  if (!tokenId) throw new Error("registerDesignToken: tokenId is required.");
  if (!definition?.category || !TOKEN_CATEGORIES.includes(definition.category)) {
    throw new Error(`registerDesignToken: invalid category for ${tokenId}.`);
  }
  if (definition.value == null && !definition.ref) {
    throw new Error(`registerDesignToken: value or ref required for ${tokenId}.`);
  }
  tokens.set(tokenId, Object.freeze({ tokenId, ...definition }));
}

/** @param {string} tokenId */
export function getDesignToken(tokenId) {
  return tokens.get(tokenId) ?? null;
}

/**
 * @param {object} [filter]
 * @param {string} [filter.category]
 */
export function listDesignTokens(filter = {}) {
  let result = [...tokens.values()];
  if (filter.category) result = result.filter((t) => t.category === filter.category);
  return result;
}

export function resolveTokenValue(tokenId, themeId = "light") {
  const token = getDesignToken(tokenId);
  if (!token) return null;
  if (token.themeOverrides?.[themeId] != null) return token.themeOverrides[themeId];
  return token.value ?? token.ref ?? null;
}

export function getDesignTokenCount() {
  return tokens.size;
}

export function clearDesignTokens() {
  tokens.clear();
}
