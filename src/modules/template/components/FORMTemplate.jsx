import React, { useMemo, useState } from "react";
import ErpScrollViewport from "@/shared/components/ErpScrollViewport";
import EmpRecordToolbar from "@/framework/cadastro/toolbars/EmpRecordToolbar";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";
import EmpDynamicFormRenderer from "@/framework/cadastro/layouts/EmpDynamicFormRenderer";
import EmpLayoutConfiguratorDialog from "@/framework/cadastro/configurators/EmpLayoutConfiguratorDialog";
import { normalizeLayoutConfig } from "@/framework/cadastro/layouts/empFormLayoutStore";

const TEMPLATE_PANELS = [
  { id: "principal", label: "Principal" },
  { id: "complementar", label: "Complementar" },
];

const TEMPLATE_DEFAULT_LAYOUT = {
  principal: ["nome", "codigo", "status"],
  complementar: ["observacao"],
};

const TEMPLATE_FIELDS = [
  { id: "nome", name: "nome", label: "Nome", type: "text", required: true },
  { id: "codigo", name: "codigo", label: "Código", type: "text", compact: true },
  { id: "status", name: "status", label: "Status", type: "select", options: [{ id: "Ativo", nome: "Ativo" }, { id: "Inativo", nome: "Inativo" }] },
  { id: "observacao", name: "observacao", label: "Observação", type: "textarea", wide: true },
];

const buildDefaultConfig = () =>
  normalizeLayoutConfig(
    {
      panels: TEMPLATE_PANELS.map((p) => ({ ...p })),
      layout: {
        principal: [...TEMPLATE_DEFAULT_LAYOUT.principal],
        complementar: [...TEMPLATE_DEFAULT_LAYOUT.complementar],
      },
      fieldSizes: { codigo: "XS", status: "SM" },
      fieldLayoutConfig: { mode: "corporate", columns: 12 },
    },
    { basePanels: TEMPLATE_PANELS, defaultLayout: TEMPLATE_DEFAULT_LAYOUT }
  );

export default function FORMTemplate({ onSubmit, onCancel }) {
  const [state, setState] = useState({ nome: "", codigo: "", status: "Ativo", observacao: "" });
  const [activeTab, setActiveTab] = useState("principal");
  const [layoutConfigOpen, setLayoutConfigOpen] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState(() => buildDefaultConfig());

  const defaultConfigFull = useMemo(() => buildDefaultConfig(), []);

  const saveLayoutConfig = (next) => {
    const normalized = normalizeLayoutConfig(
      { ...layoutConfig, ...next },
      { basePanels: TEMPLATE_PANELS, defaultLayout: TEMPLATE_DEFAULT_LAYOUT }
    );
    setLayoutConfig(normalized);
  };

  if (layoutConfigOpen) {
    return (
      <div className="cadastro-emp-scope erp-ui h-full min-h-0 overflow-hidden">
        <EmpLayoutConfiguratorDialog
          open
          onOpenChange={setLayoutConfigOpen}
          inline
          panels={layoutConfig.panels}
          fields={TEMPLATE_FIELDS}
          layout={layoutConfig.layout}
          fieldSizes={layoutConfig.fieldSizes || {}}
          fieldLayoutConfig={layoutConfig.fieldLayoutConfig}
          defaultConfig={defaultConfigFull}
          onSave={saveLayoutConfig}
        />
      </div>
    );
  }

  return (
    <div className="cadastro-emp-scope erp-ui h-full min-h-0 overflow-hidden flex flex-col">
      <EmpSplitToolbarLayout
        className="flex-1"
        toolbar={
          <EmpRecordToolbar
            title="Template de Cadastro"
            operationLabel="Laboratório V3"
            badgeLabel="TEMPLATE"
            showSaveActions
            onSave={() => onSubmit?.(state)}
            onCancel={onCancel}
            onLayoutConfigClick={() => setLayoutConfigOpen(true)}
          />
        }
      >
        <ErpScrollViewport className="form-scroll-container h-full min-h-0 flex-1 p-3">
          <div className="mb-2 flex gap-2">
            {TEMPLATE_PANELS.map((panel) => (
              <button
                key={panel.id}
                type="button"
                onClick={() => setActiveTab(panel.id)}
                className={`rounded px-3 py-1 text-xs font-semibold ${
                  activeTab === panel.id ? "bg-[#e3f4ff] text-[#2899f5]" : "bg-[#f1f5f9] text-[#64748b]"
                }`}
              >
                {panel.label}
              </button>
            ))}
          </div>
          <EmpDynamicFormRenderer
            panels={layoutConfig.panels}
            fields={TEMPLATE_FIELDS}
            layout={layoutConfig.layout}
            fieldSizes={layoutConfig.fieldSizes || {}}
            fieldLayoutConfig={layoutConfig.fieldLayoutConfig}
            activePanelId={activeTab}
            values={state}
            errors={{}}
            onChange={(name, value) => setState((prev) => ({ ...prev, [name]: value }))}
          />
        </ErpScrollViewport>
      </EmpSplitToolbarLayout>
    </div>
  );
}
