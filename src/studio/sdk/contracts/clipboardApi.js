/**
 * Clipboard API — copy/cut/paste registry entry fragments within Studio session.
 */
export function createClipboardApi() {
  let buffer = null;

  return Object.freeze({
    copy: (payload) => {
      buffer = payload ? structuredClone(payload) : null;
      return buffer;
    },
    cut: (payload) => {
      buffer = payload ? structuredClone(payload) : null;
      return buffer;
    },
    paste: () => (buffer ? structuredClone(buffer) : null),
    clear: () => {
      buffer = null;
    },
    hasContent: () => buffer != null,
    peek: () => (buffer ? structuredClone(buffer) : null),
  });
}

export default createClipboardApi;
