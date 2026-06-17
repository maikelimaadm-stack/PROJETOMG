const normalizeGroupLabel = (value) => {
  const normalized = String(value ?? "-").trim();
  return normalized || "-";
};

const compareLabels = (left, right, direction = "asc") => {
  const comparison = String(left).localeCompare(String(right), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
  return direction === "desc" ? -comparison : comparison;
};

export const buildGroupedRows = ({
  items,
  groupedColumns,
  collapsedGroupKeys,
  getFieldValue,
  sortConfig,
}) => {
  if (!Array.isArray(groupedColumns) || groupedColumns.length === 0) {
    return {
      rows: (items || []).map((empresa) => ({ __type: "row", key: `row:${empresa.id}`, emp: empresa })),
      groupKeys: [],
    };
  }

  const sortDirectionByColumn = new Map(
    (Array.isArray(sortConfig) ? sortConfig : [])
      .filter((rule) => rule?.key)
      .map((rule) => [rule.key, rule.direction === "desc" ? "desc" : "asc"])
  );

  const nextRows = [];
  const groupKeys = [];
  const sourceItems = Array.isArray(items) ? items : [];

  const groupRows = (groupItems, level, parentPath) => {
    if (level >= groupedColumns.length) {
      groupItems.forEach((empresa) => {
        nextRows.push({
          __type: "row",
          key: `row:${empresa.id}:${parentPath.join("|")}`,
          emp: empresa,
          groupKey: parentPath[parentPath.length - 1] || null,
        });
      });
      return;
    }

    const currentColumn = groupedColumns[level];
    const groupsMap = new Map();
    groupItems.forEach((empresa) => {
      const rawValue = getFieldValue(empresa, currentColumn.id);
      const label = normalizeGroupLabel(rawValue);
      if (!groupsMap.has(label)) groupsMap.set(label, []);
      groupsMap.get(label).push(empresa);
    });

    const direction = sortDirectionByColumn.get(currentColumn.id) || "asc";
    const sortedGroups = Array.from(groupsMap.entries()).sort((a, b) =>
      compareLabels(a[0], b[0], direction)
    );

    sortedGroups.forEach(([label, groupedItems]) => {
      const groupKey = `${parentPath.join(">")}|${currentColumn.id}:${label}`;
      groupKeys.push(groupKey);
      nextRows.push({
        __type: "group",
        key: `group:${groupKey}`,
        groupKey,
        level,
        label,
        columnId: currentColumn.id,
        count: groupedItems.length,
      });
      if (!collapsedGroupKeys[groupKey]) {
        groupRows(groupedItems, level + 1, [...parentPath, groupKey]);
      }
    });
  };

  groupRows(sourceItems, 0, []);
  return { rows: nextRows, groupKeys };
};

export const pruneCollapsedGroupKeys = (collapsedGroupKeys, groupKeys = []) => {
  if (!collapsedGroupKeys || typeof collapsedGroupKeys !== "object") return {};
  if (!Array.isArray(groupKeys) || groupKeys.length === 0) return {};
  const allowedKeys = new Set(groupKeys);
  const nextState = {};
  Object.entries(collapsedGroupKeys).forEach(([groupKey, collapsed]) => {
    if (!allowedKeys.has(groupKey)) return;
    nextState[groupKey] = collapsed;
  });
  return nextState;
};
