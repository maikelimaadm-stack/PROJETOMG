import { createEmptyLayoutDocument } from "./layoutDocumentContracts.js";

const DEFAULT_PANEL_LABELS = Object.freeze({
  identificacao: "Identificação",
  endereco: "Endereço",
  contato: "Contato",
  observacoes: "Observações",
});

/** MDP registry entries → Layout Document (empresas pilot) */
export function registryEntriesToLayoutDocument(registryEntries = [], moduleId = "empresas") {
  const layoutEntry =
    registryEntries.find((e) => (e.entryId ?? e.entry_id) === "empresas.layout.main") ??
    registryEntries.find((e) => (e.entryType ?? e.entry_type) === "layout");

  if (!layoutEntry) {
    return createEmptyLayoutDocument({ moduleId, documentId: `${moduleId}.layout.draft` });
  }

  const entryId = layoutEntry.entryId ?? layoutEntry.entry_id;
  const payload = layoutEntry.payload ?? {};
  const panelKeys = Array.isArray(payload.panels) ? payload.panels : [];

  const sectionEntries = registryEntries.filter(
    (e) => (e.entryType ?? e.entry_type) === "section"
  );
  const panelEntries = registryEntries.filter(
    (e) => (e.entryType ?? e.entry_type) === "panel"
  );

  const sections = panelKeys.map((panelKey, index) => {
    const sectionEntry = sectionEntries.find((s) => {
      const p = s.payload ?? {};
      return p.sectionKey === panelKey || (s.entryId ?? s.entry_id)?.includes(panelKey);
    });
    const sectionId = sectionEntry?.entryId ?? sectionEntry?.entry_id ?? `section.${panelKey}`;
    const sectionPayload = sectionEntry?.payload ?? {};

    const relatedPanels = panelEntries.filter((p) => {
      const refs = p.payload?.sections ?? [];
      return refs.includes(panelKey) || (p.entryId ?? p.entry_id)?.includes(panelKey);
    });

    const containers = relatedPanels.length
      ? relatedPanels.map((panel) => panelToContainer(panel))
      : [defaultContainerForSection(panelKey, sectionPayload)];

    return {
      sectionId,
      label: sectionEntry?.label ?? sectionEntry?.labels?.[0]?.label ?? DEFAULT_PANEL_LABELS[panelKey] ?? panelKey,
      containers,
      bindings: normalizeBindings(sectionEntry?.bindings ?? []),
      rules: sectionPayload.rules ?? [],
    };
  });

  if (!sections.length) {
    sections.push({
      sectionId: "section.default",
      label: "Seção",
      containers: [defaultContainerForSection("main", {})],
      bindings: [],
      rules: [],
    });
  }

  return createEmptyLayoutDocument({
    documentId: entryId,
    moduleId,
    entityId: layoutEntry.entityId ?? layoutEntry.entity_id ?? null,
    metadata: {
      label: layoutEntry.label ?? layoutEntry.labels?.[0]?.label ?? "Layout",
      status: layoutEntry.status ?? "draft",
      layoutKey: payload.layoutKey ?? entryId,
      defaultLayoutRef: payload.defaultLayoutRef ?? null,
      registryEntryId: layoutEntry.id ?? null,
    },
    pages: [
      {
        pageId: "page.main",
        label: payload.layoutKey ?? "Principal",
        sections,
      },
    ],
    bindings: normalizeBindings(layoutEntry.bindings ?? []),
    rules: payload.rules ?? [],
    styles: payload.styles ?? {},
    behaviors: payload.behaviors ?? [],
  });
}

function panelToContainer(panel) {
  const payload = panel.payload ?? {};
  return {
    containerId: panel.entryId ?? panel.entry_id ?? `container.${payload.panelKey ?? "panel"}`,
    type: "panel",
    components: (payload.sections ?? []).map((sectionRef, idx) => ({
      componentId: `${panel.entryId ?? panel.entry_id}.component.${idx}`,
      type: "section-ref",
      props: { sectionRef },
      bindings: [],
      rules: [],
      styles: {},
      behaviors: [],
      frame: { x: 16, y: 16 + idx * 72, width: 280, height: 64 },
    })),
    styles: payload.styles ?? {},
    bindings: normalizeBindings(panel.bindings ?? []),
  };
}

function defaultContainerForSection(panelKey, sectionPayload) {
  const fields = sectionPayload.fields ?? [];
  return {
    containerId: `container.${panelKey}`,
    type: "panel",
    components: fields.slice(0, 8).map((fieldId, idx) => ({
      componentId: `component.${panelKey}.${fieldId}`,
      type: "field",
      props: { fieldId },
      bindings: [{ bindingKind: "field", targetId: fieldId }],
      rules: [],
      styles: {},
      behaviors: [],
      frame: { x: 16, y: 16 + idx * 48, width: 240, height: 40 },
    })),
    styles: {},
    bindings: [],
  };
}

function normalizeBindings(bindings) {
  return (bindings ?? []).map((b) => ({
    bindingKind: b.bindingKind ?? b.binding_kind ?? "entry",
    targetId: b.targetId ?? b.target_id ?? "",
  }));
}

export default registryEntriesToLayoutDocument;
