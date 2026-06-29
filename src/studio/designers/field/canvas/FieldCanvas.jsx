import { useCallback, useMemo, useState } from "react";
import { listSmartFieldTemplates, listSmartFieldTemplateCategories } from "../templates/smartFieldTemplates.js";
import { listBusinessFieldTypes, listBusinessFieldTypeCategories } from "../businessTypes/businessTypeCatalog.js";
import { collectActiveFields } from "../fieldPropertyFields.js";

const BASIC_FIELD_TYPES = Object.freeze(["string", "number", "boolean", "date", "text", "select"]);

const TEMPLATE_ICONS = Object.freeze({
  "id-card": "🪪",
  building: "🏢",
  mail: "✉️",
  phone: "📞",
  "map-pin": "📍",
  link: "🔗",
  "qr-code": "◻️",
  calendar: "📅",
  clock: "🕐",
  "calendar-clock": "📆",
});

const BUSINESS_ICONS = Object.freeze({
  users: "👥",
  truck: "🚚",
  package: "📦",
  "user-check": "✅",
  landmark: "🏦",
  "pie-chart": "📊",
  home: "🏠",
  grid: "▦",
  fence: "🚧",
  layers: "📚",
  beef: "🐄",
  cog: "⚙️",
  sprout: "🌱",
});

/** Field canvas — Smart Authoring (Program 2.3.1) */
export function FieldCanvas({
  document: fieldDocument,
  selectedFieldNodeId,
  onSelectField,
  commandBus,
}) {
  const [activeTab, setActiveTab] = useState("templates");
  const [filterCategory, setFilterCategory] = useState("all");

  const templates = listSmartFieldTemplates();
  const templateCategories = listSmartFieldTemplateCategories();
  const businessTypes = listBusinessFieldTypes();
  const businessCategories = listBusinessFieldTypeCategories();
  const groups = fieldDocument?.groups ?? [];
  const allFields = useMemo(() => collectActiveFields(fieldDocument), [fieldDocument]);

  const handleAddBasic = useCallback(
    (fieldType) => {
      commandBus?.addField(fieldType, `Novo ${fieldType}`, null, "group.main");
    },
    [commandBus]
  );

  const handleAddTemplate = useCallback(
    (templateId) => {
      commandBus?.addFieldFromTemplate(templateId, "group.main");
    },
    [commandBus]
  );

  const handleAddBusinessType = useCallback(
    (businessTypeId) => {
      commandBus?.addFieldFromBusinessType(businessTypeId, "group.main");
    },
    [commandBus]
  );

  const handleMove = useCallback(
    (fieldNodeId, direction, groupFields) => {
      const idx = groupFields.findIndex((f) => f.fieldNodeId === fieldNodeId);
      if (idx < 0) return;
      const toIndex = direction === "up" ? Math.max(0, idx - 1) : Math.min(groupFields.length - 1, idx + 1);
      if (toIndex !== idx) commandBus?.reorderField(fieldNodeId, toIndex);
    },
    [commandBus]
  );

  const filteredTemplates =
    filterCategory === "all" ? templates : templates.filter((t) => t.category === filterCategory);

  const filteredBusiness =
    filterCategory === "all" ? businessTypes : businessTypes.filter((t) => t.category === filterCategory);

  return (
    <div className="field-canvas flex h-full flex-col bg-muted/10">
      <div className="border-b border-border px-3 py-2">
        <div className="flex gap-1 text-[11px]">
          {[
            { id: "templates", label: "Templates inteligentes" },
            { id: "business", label: "Business Types" },
            { id: "basic", label: "Tipos básicos" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rounded px-2 py-1 ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {(activeTab === "templates" || activeTab === "business") && (
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              type="button"
              className={`rounded px-2 py-0.5 text-[10px] ${filterCategory === "all" ? "bg-foreground text-background" : "bg-background border border-border"}`}
              onClick={() => setFilterCategory("all")}
            >
              Todas
            </button>
            {(activeTab === "templates" ? templateCategories : businessCategories).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`rounded px-2 py-0.5 text-[10px] capitalize ${filterCategory === cat ? "bg-foreground text-background" : "bg-background border border-border"}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {activeTab === "templates" && (
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {filteredTemplates.map((template) => (
              <button
                key={template.templateId}
                type="button"
                title={template.documentation}
                className="flex flex-col items-start rounded border border-border bg-background p-2 text-left hover:border-primary hover:bg-primary/5"
                onClick={() => handleAddTemplate(template.templateId)}
              >
                <span className="text-base">{TEMPLATE_ICONS[template.icon] ?? "📋"}</span>
                <span className="mt-1 text-[11px] font-medium">{template.label}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{template.category}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === "business" && (
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {filteredBusiness.map((bt) => (
              <button
                key={bt.businessTypeId}
                type="button"
                title={bt.description ?? `Business Type: ${bt.label}`}
                className="flex flex-col items-start rounded border border-dashed border-border bg-background p-2 text-left hover:border-primary"
                onClick={() => handleAddBusinessType(bt.businessTypeId)}
              >
                <span className="text-base">{BUSINESS_ICONS[bt.icon] ?? "🏷️"}</span>
                <span className="mt-1 text-[11px] font-medium">{bt.label}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{bt.category}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === "basic" && (
          <div className="mt-2 flex flex-wrap gap-2">
            {BASIC_FIELD_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className="rounded border border-border bg-background px-2 py-1 text-[11px] hover:bg-muted"
                onClick={() => handleAddBasic(type)}
              >
                + {type}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="mb-2 text-xs text-muted-foreground">
          {allFields.length} campo(s) · entidade {fieldDocument?.entityId}
        </div>

        {groups.map((group) => {
          const fields = (group.fields ?? []).filter((f) => !f._pendingDelete);
          if (!fields.length) return null;
          return (
            <section key={group.groupId} className="mb-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground">
                <span>{group.label ?? group.groupId}</span>
                {group.category && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-normal capitalize text-muted-foreground">
                    {group.category}
                  </span>
                )}
              </div>
              <ul className="space-y-2">
                {fields.map((field, index) => {
                  const selected = field.fieldNodeId === selectedFieldNodeId;
                  return (
                    <li
                      key={field.fieldNodeId}
                      className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-xs ${
                        selected ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/50"
                      }`}
                      onClick={() => onSelectField(field)}
                    >
                      <span className="font-mono text-muted-foreground">{index + 1}.</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {field.icon && <span>{TEMPLATE_ICONS[field.icon] ?? BUSINESS_ICONS[field.icon] ?? "•"}</span>}
                          <span className="font-medium truncate">{field.label}</span>
                          {field.smartTemplateId && (
                            <span className="rounded bg-primary/10 px-1 text-[9px] text-primary">{field.smartTemplateId}</span>
                          )}
                          {field.businessTypeId && (
                            <span className="rounded bg-muted px-1 text-[9px] capitalize">{field.businessTypeId}</span>
                          )}
                        </div>
                        <div className="text-muted-foreground truncate">
                          {field.fieldName} · {field.fieldType}
                          {field.required ? " · obrigatório" : ""}
                          {field.useMask && field.maskText ? ` · ${field.maskText}` : ""}
                          {field.category ? ` · ${field.category}` : ""}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          className="rounded px-1 hover:bg-muted"
                          title="Mover para cima"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMove(field.fieldNodeId, "up", fields);
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="rounded px-1 hover:bg-muted"
                          title="Mover para baixo"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMove(field.fieldNodeId, "down", fields);
                          }}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="rounded px-1 text-destructive hover:bg-destructive/10"
                          title="Excluir"
                          onClick={(e) => {
                            e.stopPropagation();
                            commandBus?.deleteField(field.fieldNodeId);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {allFields.length === 0 && (
          <div className="rounded border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Nenhum campo. Use um template inteligente acima — propriedades, máscara e validações são preenchidas automaticamente.
          </div>
        )}
      </div>
    </div>
  );
}

export default FieldCanvas;
