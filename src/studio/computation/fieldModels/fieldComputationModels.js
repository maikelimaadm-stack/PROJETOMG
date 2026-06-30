import { COMPUTATION_FIELD_KINDS } from "../contracts/computationContracts.js";

/** Field computation models — contracts only, no UI (Program 3.1) */

export const FIELD_COMPUTATION_MODELS = Object.freeze({
  computed: Object.freeze({
    source: "computed",
    mutability: "read-only",
    evaluation: "on-read-incremental",
    storage: "virtual",
  }),
  derived: Object.freeze({
    source: "derived",
    mutability: "write-time",
    evaluation: "on-save",
    storage: "native",
  }),
  aggregation: Object.freeze({
    source: "aggregation",
    mutability: "read-only",
    evaluation: "batch",
    storage: "virtual",
  }),
  rollup: Object.freeze({
    source: "rollup",
    mutability: "read-only",
    evaluation: "batch-deferred",
    storage: "virtual",
    costTier: "O cross-entity",
  }),
  lookup: Object.freeze({
    source: "lookup",
    mutability: "read-only",
    evaluation: "lazy",
    storage: "virtual",
  }),
  calculated_collection: Object.freeze({
    source: "calculated_collection",
    mutability: "read-only",
    evaluation: "lazy-paginated",
    storage: "virtual",
  }),
});

export function getFieldComputationModel(fieldKind) {
  if (!COMPUTATION_FIELD_KINDS.includes(fieldKind)) return null;
  return FIELD_COMPUTATION_MODELS[fieldKind] ?? null;
}

export function listFieldComputationModels() {
  return COMPUTATION_FIELD_KINDS.map((kind) => ({
    kind,
    model: FIELD_COMPUTATION_MODELS[kind],
  }));
}

export default FIELD_COMPUTATION_MODELS;
