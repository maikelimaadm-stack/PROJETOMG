/** Business Field Types — architectural contracts (Program 2.3.1) */

export const BUSINESS_FIELD_TYPE_VERSION = "mak-business-field-type-v1";

/**
 * Business types describe semantic field categories for future relationship/computed phases.
 * No business rules are implemented in 2.3.1 — registration and metadata only.
 *
 * @typedef {object} BusinessFieldType
 * @property {string} businessTypeId
 * @property {string} label
 * @property {string} icon
 * @property {string} category
 * @property {string} [description]
 * @property {string} [targetEntityHint] — future MDP entity reference
 * @property {boolean} [aiReady] — prepared for IA suggestions
 */

export default BUSINESS_FIELD_TYPE_VERSION;
