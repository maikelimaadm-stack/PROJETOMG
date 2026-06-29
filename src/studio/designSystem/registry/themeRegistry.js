const themes = new Map();

/**
 * @param {string} themeId
 * @param {object} definition
 */
export function registerDesignTheme(themeId, definition) {
  if (!themeId) throw new Error("registerDesignTheme: themeId is required.");
  if (!definition?.label) throw new Error("registerDesignTheme: label is required.");
  themes.set(
    themeId,
    Object.freeze({
      themeId,
      status: definition.status ?? "reserved",
      tokenOverrides: definition.tokenOverrides ?? {},
      ...definition,
    })
  );
}

/** @param {string} themeId */
export function getDesignTheme(themeId) {
  return themes.get(themeId) ?? null;
}

export function listDesignThemes(filter = {}) {
  let result = [...themes.values()];
  if (filter.status) result = result.filter((t) => t.status === filter.status);
  return result;
}

export function getDesignThemeCount() {
  return themes.size;
}

export function clearDesignThemes() {
  themes.clear();
}
