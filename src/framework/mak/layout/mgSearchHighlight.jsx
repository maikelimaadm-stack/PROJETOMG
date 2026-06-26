import React from "react";
import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildSearchHighlightRegex = (query) => {
  const term = normalizeSearchQuery(query);
  if (!term) return null;

  const parts = term.split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (parts.length === 0) return null;

  return new RegExp(parts.join("\\s+"), "gi");
};

/** Destaca trechos que contêm o termo (case-insensitive, ignora espaços extras). */
export function renderSearchHighlight(text, query) {
  const source = text == null || text === "—" ? "" : String(text);
  const regex = buildSearchHighlightRegex(query);
  if (!regex || !source) return source || "—";

  const nodes = [];
  let lastIndex = 0;
  let key = 0;
  const matcher = new RegExp(regex.source, regex.flags);

  for (const match of source.matchAll(matcher)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      nodes.push(source.slice(lastIndex, start));
    }
    nodes.push(
      <mark key={`m-${key++}`} className="mg-search-dropdown__mark">
        {match[0]}
      </mark>
    );
    lastIndex = start + match[0].length;
  }

  if (lastIndex < source.length) {
    nodes.push(source.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : source;
}
