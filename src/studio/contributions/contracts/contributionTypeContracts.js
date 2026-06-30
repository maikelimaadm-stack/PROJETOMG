/** Contribution type-specific payload contracts (Program 2.1A.7) */

/**
 * @typedef {object} ExplorerContribution
 * @property {string} contributionId
 * @property {string} label
 * @property {string} [icon]
 * @property {number} [priority]
 */

/**
 * @typedef {object} ToolbarContribution
 * @property {string} contributionId
 * @property {string} label
 * @property {string} [group]
 * @property {() => void} [action]
 */

/**
 * @typedef {object} InspectorContribution
 * @property {string} contributionId
 * @property {string} label
 * @property {string[]} [entryTypes]
 */

/**
 * @typedef {object} CommandContribution
 * @property {string} contributionId
 * @property {string} label
 * @property {string} [category]
 * @property {() => void} [run]
 */

/**
 * @typedef {object} ContextMenuContribution
 * @property {string} contributionId
 * @property {string} label
 * @property {string[]} [contexts]
 */

/**
 * @typedef {object} DockContribution
 * @property {string} contributionId
 * @property {string} label
 * @property {"left"|"right"|"bottom"} region
 */

/**
 * @typedef {object} PropertyContribution
 * @property {string} contributionId
 * @property {string} propertyId
 * @property {string} label
 * @property {string} [group]
 */

export const CONTRIBUTION_PAYLOAD_KEYS = Object.freeze({
  explorer: ["contributionId", "label"],
  toolbar: ["contributionId", "label"],
  inspector: ["contributionId", "label"],
  command: ["contributionId", "label"],
  contextMenu: ["contributionId", "label"],
  dock: ["contributionId", "label", "region"],
  property: ["contributionId", "propertyId", "label"],
});

export function validateContributionPayload(type, payload) {
  const required = CONTRIBUTION_PAYLOAD_KEYS[type] ?? [];
  const errors = required.filter((key) => !payload?.[key]).map((key) => `Missing ${key}`);
  return { valid: errors.length === 0, errors };
}
