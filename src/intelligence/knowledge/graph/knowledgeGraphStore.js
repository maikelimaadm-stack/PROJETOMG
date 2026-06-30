import {
  KNOWLEDGE_GRAPH_STORE_VERSION,
  KNOWLEDGE_NODE_SCHEMA_VERSION,
  KNOWLEDGE_NODE_KINDS,
  KNOWLEDGE_OWNERSHIP,
} from "./knowledgeGraphContracts.js";

const STORAGE_KEY = "mak-enterprise-knowledge-graph-v1";
const memoryFallback = { nodes: [], edges: [], audit: [], versions: {} };

function readGraphStore() {
  if (typeof localStorage === "undefined") {
    return {
      nodes: [...memoryFallback.nodes],
      edges: [...memoryFallback.edges],
      audit: [...memoryFallback.audit],
      versions: { ...memoryFallback.versions },
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { nodes: [], edges: [], audit: [], versions: {} };
    return JSON.parse(raw);
  } catch {
    return { nodes: [], edges: [], audit: [], versions: {} };
  }
}

function writeGraphStore(data) {
  const trimmed = {
    nodes: (data.nodes ?? []).slice(0, 2000),
    edges: (data.edges ?? []).slice(0, 4000),
    audit: (data.audit ?? []).slice(0, 200),
    versions: data.versions ?? {},
  };
  if (typeof localStorage === "undefined") {
    memoryFallback.nodes.length = 0;
    memoryFallback.nodes.push(...trimmed.nodes);
    memoryFallback.edges.length = 0;
    memoryFallback.edges.push(...trimmed.edges);
    memoryFallback.audit.length = 0;
    memoryFallback.audit.push(...trimmed.audit);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getKnowledgeGraphStoreInfo() {
  return Object.freeze({
    schemaVersion: KNOWLEDGE_GRAPH_STORE_VERSION,
    tenantScoped: true,
    belongsToEnterprise: true,
  });
}

export function upsertKnowledgeNode(node) {
  const store = readGraphStore();
  store.nodes = [node, ...store.nodes.filter((n) => n.nodeId !== node.nodeId)];
  writeGraphStore(store);
  return node;
}

export function upsertKnowledgeEdge(edge) {
  const store = readGraphStore();
  store.edges = [edge, ...store.edges.filter((e) => e.edgeId !== edge.edgeId)];
  writeGraphStore(store);
  return edge;
}

export function listKnowledgeNodes(tenantId = "default", options = {}) {
  const limit = options.limit ?? 200;
  let nodes = readGraphStore().nodes.filter((n) => n.tenantId === tenantId);
  if (options.kind) nodes = nodes.filter((n) => n.kind === options.kind);
  if (options.refId) nodes = nodes.filter((n) => n.refId === options.refId);
  return nodes.slice(0, limit);
}

export function listKnowledgeEdges(tenantId = "default", options = {}) {
  const limit = options.limit ?? 400;
  let edges = readGraphStore().edges.filter((e) => e.tenantId === tenantId);
  if (options.relationshipKind) {
    edges = edges.filter((e) => e.relationshipKind === options.relationshipKind);
  }
  if (options.fromNodeId) edges = edges.filter((e) => e.fromNodeId === options.fromNodeId);
  if (options.toNodeId) edges = edges.filter((e) => e.toNodeId === options.toNodeId);
  return edges.slice(0, limit);
}

export function createKnowledgeNode(partial) {
  return Object.freeze({
    schemaVersion: KNOWLEDGE_NODE_SCHEMA_VERSION,
    nodeId: partial.nodeId ?? `knode-${partial.tenantId}-${partial.kind}-${partial.refId ?? Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    kind: partial.kind ?? KNOWLEDGE_NODE_KINDS.ENTITY,
    refId: partial.refId ?? null,
    label: partial.label ?? "Entidade de negócio",
    description: partial.description ?? "",
    memoryId: partial.memoryId ?? null,
    lineage: Object.freeze(partial.lineage ?? []),
    ownership: KNOWLEDGE_OWNERSHIP,
    indexedAt: new Date().toISOString(),
    explainable: true,
    aiGenerated: false,
  });
}

export default {
  upsertKnowledgeNode,
  upsertKnowledgeEdge,
  listKnowledgeNodes,
  listKnowledgeEdges,
};
