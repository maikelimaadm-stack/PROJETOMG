/** Extension points — not implemented in Program 3.8 */
export const BUSINESS_COMPUTED_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "automation.derivation", implemented: false }),
  Object.freeze({ id: "dashboard.derivation", implemented: false }),
  Object.freeze({ id: "report.derivation", implemented: false }),
  Object.freeze({ id: "integration.derivation", implemented: false }),
  Object.freeze({ id: "marketplace.runtime", implemented: false }),
  Object.freeze({ id: "ai.runtime", implemented: false }),
  Object.freeze({ id: "decision.engine", implemented: false }),
  Object.freeze({ id: "knowledge.engine", implemented: false }),
]);

export default BUSINESS_COMPUTED_EXTENSION_POINTS;
