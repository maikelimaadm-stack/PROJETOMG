/** Property Grid Service — schema-driven property editing (Program 2.2.7) */

import { EDITOR_HUB_EVENTS } from "../contracts/editorContracts.js";

export function createPropertyGridService(deps = {}) {
  const { hub } = deps;

  const publishChange = ({ designerId, targetId, propertyId, value, source = "property-grid" }) => {
    hub?.publish?.(EDITOR_HUB_EVENTS.PROPERTY_CHANGE, {
      designerId,
      targetId,
      propertyId,
      value,
      source,
    });
  };

  const configure = ({ hasSelection, fields, onFieldChange, readOnly, emptyState }) =>
    Object.freeze({ hasSelection, fields, onFieldChange, readOnly, emptyState });

  return Object.freeze({ publishChange, configure });
}

export default createPropertyGridService;
