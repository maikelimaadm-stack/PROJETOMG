/** Normaliza texto de busca: trim + colapsa espaços consecutivos. */
export function normalizeSearchQuery(query) {
  return String(query || "")
    .trim()
    .replace(/\s+/g, " ");
}
