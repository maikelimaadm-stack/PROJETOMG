/** Preview Service — bottom preview panel integration (Program 2.2.7) */

import { EDITOR_HUB_EVENTS } from "../contracts/editorContracts.js";

export function createPreviewService(deps = {}) {
  const { hub } = deps;

  const publishChange = ({ designerId, message, ok = true, compileId = null, payload = {} }) => {
    const event = Object.freeze({
      designerId,
      message,
      ok,
      compileId,
      ...payload,
    });
    hub?.publish?.(EDITOR_HUB_EVENTS.PREVIEW_CHANGED, event);
    return event;
  };

  const resolveMessage = ({ editorPreview, domainPreview, fallback }) =>
    editorPreview ?? domainPreview ?? fallback;

  return Object.freeze({ publishChange, resolveMessage });
}

export default createPreviewService;
