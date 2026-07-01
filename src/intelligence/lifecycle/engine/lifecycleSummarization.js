import { retrieveLifecycleByContext } from "./lifecycleRetrieval.js";
import { LIFECYCLE_OWNERSHIP } from "./dataLifecycleContracts.js";

export function summarizeLifecycleEngine(groupId) {
  const r = retrieveLifecycleByContext(groupId);
  const headline =
    r.lifecycleDocs.length > 0
      ? `${r.lifecycleRules.length} políticas · ${r.archiveLifecycles.length} arquiváveis · ${r.expungeApprovals.filter((a) => a.status === "pending_approval").length} aprovações pendentes`
      : "Ciclo de vida será consolidado quando escopo autorizado estiver ativo.";

  return Object.freeze({
    groupId,
    summarizedAt: new Date().toISOString(),
    documentCount: r.lifecycleDocs.length,
    ruleCount: r.lifecycleRules.length,
    archiveCount: r.archiveLifecycles.length,
    holdCount: r.holdEnforcements.filter((h) => h.active).length,
    eventCount: r.events.length,
    headline,
    lifecycleStatus: r.lifecycleDocs.length > 0 ? "active" : "pending",
    explainable: true,
    expungeAllowed: false,
    ...LIFECYCLE_OWNERSHIP,
  });
}

export default summarizeLifecycleEngine;
