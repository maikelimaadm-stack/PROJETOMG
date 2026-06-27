/** Statuses do ciclo de importação MAK. */
export const MAK_IMPORT_STATUS = Object.freeze({
  IDLE: "idle",
  PARSING: "parsing",
  MAPPED: "mapped",
  VALIDATING: "validating",
  SUBMITTING: "submitting",
  SUCCESS: "success",
  ERROR: "error",
  BACKEND_PENDING: "backend_pending",
});

export const MAK_IMPORT_BACKEND_PENDING_CODE = "MAK_IMPORT_BACKEND_PENDING";

export const MAK_IMPORT_EVENTS = Object.freeze({
  STARTED: "import-started",
  PARSED: "import-parsed",
  MAPPED: "import-mapped",
  VALIDATED: "import-validated",
  SUBMITTED: "import-submitted",
  COMPLETED: "import-completed",
  FAILED: "import-failed",
  RESET: "import-reset",
});

export const MAK_IMPORT_STORAGE_PREFIX = "mak_import_draft_v1";

export default MAK_IMPORT_STATUS;
