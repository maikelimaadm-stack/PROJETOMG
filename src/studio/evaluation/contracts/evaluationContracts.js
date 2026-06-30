/** Studio Evaluation Engine — official contracts (Program 2.3.5) */

export const STUDIO_EVALUATION_VERSION = "mak-studio-evaluation-v1";

export const EVALUATION_SESSION_VERSION = "mak-studio-evaluation-session-v1";

export const OFFICIAL_EVALUATION_ENGINES = Object.freeze([
  "context",
  "session",
  "pipeline",
  "cache",
  "scheduler",
  "strategy",
  "diagnostics",
  "profiler",
  "hooks",
]);

export const EVALUATION_STRATEGIES = Object.freeze([
  "eager",
  "lazy",
  "batch",
  "incremental",
]);

export const EVALUATION_MODES = Object.freeze([
  "expression",
  "dependency-ordered",
  "type-validated",
]);

export default STUDIO_EVALUATION_VERSION;
