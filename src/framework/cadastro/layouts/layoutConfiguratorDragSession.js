/** Clone cards state captured at drag start (for cancel/revert). */
export const cloneCardsByPanel = (cardsByPanel) =>
  JSON.parse(JSON.stringify(cardsByPanel ?? {}));

export const findFieldRowIdInCard = (rows = [], fieldId = "") => {
  const row = rows.find((item) => (item.fieldIds || []).includes(fieldId));
  return row?.id || null;
};

/**
 * Live preview mutates the row tree and unmounts the drag source when a field
 * changes row/card/panel mid-drag — that prevents dragend and leaves UI stuck.
 * Only reorder within the same row may preview live (same pattern as panel tabs).
 */
export const shouldLivePreviewFieldMove = ({
  rows = [],
  fieldIds = [],
  targetFieldId = null,
  targetRowId = null,
  targetPanelId = null,
  targetCardId = null,
  sourcePanelId = null,
  sourceCardId = null,
}) => {
  if (targetPanelId && sourcePanelId && targetPanelId !== sourcePanelId) return false;
  if (targetCardId && sourceCardId && targetCardId !== sourceCardId) return false;

  const sourceRowIds = fieldIds
    .map((id) => findFieldRowIdInCard(rows, id))
    .filter(Boolean);

  if (fieldIds.some((id) => !findFieldRowIdInCard(rows, id))) {
    return false;
  }

  if (!sourceRowIds.length) return false;

  const uniqueSourceRows = new Set(sourceRowIds);
  if (uniqueSourceRows.size !== 1) return false;

  const sourceRowId = sourceRowIds[0];

  if (targetRowId) {
    return targetRowId === sourceRowId;
  }

  if (targetFieldId) {
    return findFieldRowIdInCard(rows, targetFieldId) === sourceRowId;
  }

  return false;
};

export const buildFieldPreviewKey = ({
  fieldIds = [],
  targetPanelId = "",
  targetCardId = "",
  targetFieldId = "",
  targetRowId = "",
  edge = "auto",
} = {}) =>
  [
    fieldIds.join(","),
    targetPanelId,
    targetCardId,
    targetFieldId || "",
    targetRowId || "",
    edge,
  ].join("|");

export const buildRowHoverKey = ({
  fieldIds = [],
  targetPanelId = "",
  targetCardId = "",
  targetRowId = "",
} = {}) => `${fieldIds.join(",")}|${targetPanelId}|${targetCardId}|row:${targetRowId}`;

export const buildFieldHoverKey = ({
  fieldIds = [],
  targetPanelId = "",
  targetCardId = "",
  targetFieldId = "",
} = {}) => `${fieldIds.join(",")}|${targetPanelId}|${targetCardId}|${targetFieldId}`;

/** Ignore dragLeave fired when moving between child elements inside the same drop zone. */
export const isDragLeaveWithinContainer = (currentTarget, relatedTarget) => {
  if (!currentTarget || !relatedTarget) return false;
  return currentTarget.contains(relatedTarget);
};
