/**
 * Minimal observability stub for RT-0 (M24 partial — completed in C.17).
 * @param {string} name
 * @param {{ traceId: string }} ctx
 */
export function startSpan(name, ctx) {
  const span = {
    name,
    traceId: ctx.traceId,
    ended: false,
    end() {
      this.ended = true;
    },
  };
  return span;
}

/**
 * @param {'info' | 'warn' | 'error' | 'debug'} _level
 * @param {string} _message
 * @param {{ traceId?: string } & Record<string, unknown>} [_meta]
 */
export function log(_level, _message, _meta = {}) {
  // Stub — structured logging wired in Foundation C.17 (M24)
}
