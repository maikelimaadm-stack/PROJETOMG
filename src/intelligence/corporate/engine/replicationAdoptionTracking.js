import { listAdoptions } from "../../adoption/engine/adoptionEngineStore.js";
import { listReplications } from "../../recommendation/engine/recommendationEngineStore.js";

export function trackReplicationAdoption(tenantId = "default") {
  const adoptions = listAdoptions(tenantId);
  const replications = listReplications(tenantId);

  const tracked = replications.map((rep) => {
    const relatedAdoption = adoptions.find((a) => a.replicationId === rep.replicationId);
    return Object.freeze({
      replicationId: rep.replicationId,
      title: rep.title,
      adoptionStatus: relatedAdoption?.status ?? "not_started",
      progressPercent: relatedAdoption?.progressPercent ?? 0,
      adopted: relatedAdoption?.progressPercent >= 80,
      requiresHumanApproval: true,
      autonomousReplicationForbidden: true,
    });
  });

  return Object.freeze({
    tenantId,
    trackedAt: new Date().toISOString(),
    replications: Object.freeze(tracked),
    adoptedCount: tracked.filter((t) => t.adopted).length,
    pendingCount: tracked.filter((t) => !t.adopted && t.adoptionStatus !== "not_started").length,
    explainable: true,
  });
}

export default trackReplicationAdoption;
