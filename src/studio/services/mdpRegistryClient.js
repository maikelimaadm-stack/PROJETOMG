/**
 * MDP Registry CRUD client — public HTTP API only (Program 2.2).
 */
import { apiClient } from "@/apis/http/apiClient.js";

const MDP_API_BASE = "/api/mdp";
const MDP_REGISTRY = "registry";

export async function mdpRegistryList(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value != null && value !== "") params.set(key, String(value));
  });
  const qs = params.toString();
  return apiClient.get(`${MDP_API_BASE}/${MDP_REGISTRY}${qs ? `?${qs}` : ""}`);
}

export async function mdpRegistryGet(id) {
  return apiClient.get(`${MDP_API_BASE}/${MDP_REGISTRY}/${encodeURIComponent(id)}`);
}

export async function mdpRegistryCreate(body) {
  return apiClient.post(`${MDP_API_BASE}/${MDP_REGISTRY}`, body);
}

export async function mdpRegistryUpdate(id, body) {
  return apiClient.put(`${MDP_API_BASE}/${MDP_REGISTRY}/${encodeURIComponent(id)}`, body);
}

export async function mdpRegistryDelete(id) {
  return apiClient.delete(`${MDP_API_BASE}/${MDP_REGISTRY}/${encodeURIComponent(id)}`);
}

/** Sync layout registry entries from AST-derived payloads */
export async function mdpRegistrySyncLayoutEntries(entries = []) {
  const results = [];
  for (const entry of entries) {
    try {
      const existing = await mdpRegistryGet(entry.entryId).catch(() => null);
      if (existing?.id ?? existing?.entryId) {
        const dbId = existing.id ?? existing.entryId;
        results.push(await mdpRegistryUpdate(dbId, entry));
      } else {
        results.push(await mdpRegistryCreate(entry));
      }
    } catch (err) {
      results.push({ ok: false, entryId: entry.entryId, error: err?.message });
    }
  }
  return results;
}

export default {
  mdpRegistryList,
  mdpRegistryGet,
  mdpRegistryCreate,
  mdpRegistryUpdate,
  mdpRegistryDelete,
  mdpRegistrySyncLayoutEntries,
};
