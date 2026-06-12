import React from "react";

/** Destaca trechos que contêm o termo (case-insensitive). */
export function renderSearchHighlight(text, query) {
  const source = text == null || text === "—" ? "" : String(text);
  const term = String(query || "").trim();
  if (!term || !source) return source || "—";

  const lowerSource = source.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const nodes = [];
  let cursor = 0;
  let matchIndex = lowerSource.indexOf(lowerTerm, cursor);
  let key = 0;

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      nodes.push(source.slice(cursor, matchIndex));
    }
    nodes.push(
      <mark key={`m-${key++}`} className="mg-search-dropdown__mark">
        {source.slice(matchIndex, matchIndex + term.length)}
      </mark>
    );
    cursor = matchIndex + term.length;
    matchIndex = lowerSource.indexOf(lowerTerm, cursor);
  }

  if (cursor < source.length) {
    nodes.push(source.slice(cursor));
  }

  return nodes.length > 0 ? nodes : source;
}
