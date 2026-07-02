/**
 * URL path matcher with :param segments.
 */
export class RouteMatcher {
  /**
   * @param {string} pattern
   */
  static compile(pattern) {
    const segments = pattern.split('/').filter(Boolean);
    /** @type {Array<{type: 'literal'|'param', value: string}>} */
    const tokens = segments.map((segment) => {
      if (segment.startsWith(':')) {
        return { type: 'param', value: segment.slice(1) };
      }
      return { type: 'literal', value: segment };
    });

    return {
      pattern,
      tokens,
      regex: RouteMatcher.toRegex(tokens),
    };
  }

  /**
   * @param {Array<{type: 'literal'|'param', value: string}>} tokens
   */
  static toRegex(tokens) {
    const parts = tokens.map((token) => {
      if (token.type === 'param') return '([^/]+)';
      return token.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    });
    return new RegExp(`^/${parts.join('/')}/?$`);
  }

  /**
   * @param {ReturnType<typeof RouteMatcher.compile>} compiled
   * @param {string} path
   */
  static match(compiled, path) {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const match = normalized.match(compiled.regex);
    if (!match) return null;

    /** @type {Record<string, string>} */
    const params = {};
    let paramIndex = 1;
    for (const token of compiled.tokens) {
      if (token.type === 'param') {
        params[token.value] = decodeURIComponent(match[paramIndex] ?? '');
        paramIndex += 1;
      }
    }

    return params;
  }
}
