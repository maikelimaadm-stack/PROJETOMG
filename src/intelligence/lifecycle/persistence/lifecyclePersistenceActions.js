import {
  approveLifecycleRequest,
  rejectLifecycleRequest,
} from "@/intelligence/lifecycle/persistence/approvalWorkflowEngine.js";
import { processExecutionQueue } from "@/intelligence/lifecycle/persistence/lifecycleExecutionQueue.js";

export function approvePersistentLifecycleRequest(requestId, actorId = "administrador") {
  const result = approveLifecycleRequest(requestId, actorId);
  if (result.approved) {
    processExecutionQueue(result.request.groupId, { limit: 1 });
  }
  return result;
}

export function rejectPersistentLifecycleRequest(requestId, actorId = "administrador", reason = "") {
  return rejectLifecycleRequest(requestId, actorId, reason);
}

export default { approvePersistentLifecycleRequest, rejectPersistentLifecycleRequest };
