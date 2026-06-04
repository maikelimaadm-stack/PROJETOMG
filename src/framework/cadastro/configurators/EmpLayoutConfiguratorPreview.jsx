import React, { useMemo } from "react";
import EmpDynamicFormRenderer from "@/framework/cadastro/layouts/EmpDynamicFormRenderer";
import { buildLayoutV3FromCards } from "@/framework/cadastro/layouts/empFormLayoutCards";

/**
 * Preview em tempo real do layout (sem salvar).
 */
export default function EmpLayoutConfiguratorPreview({
  panels = [],
  fields = [],
  cardsByPanel = {},
  hiddenFieldIds = [],
  lockedFieldIds = [],
  requiredFieldIds = [],
  visibilityRules = {},
  fieldSizes = {},
  fieldLayoutConfig,
  activePanelId,
  values = {},
}) {
  const layout = useMemo(() => buildLayoutV3FromCards(cardsByPanel), [cardsByPanel]);
  const previewPanels = panels.filter((panel) => !panel.hidden);

  return (
    <div className="emp-layout-config-preview-inner cadastro-emp-scope erp-ui">
      <div className="mb-2 text-xs font-semibold text-[#5b6b80]">Pré-visualização</div>
      <EmpDynamicFormRenderer
        panels={previewPanels}
        fields={fields}
        layout={layout}
        hiddenFieldIds={hiddenFieldIds}
        lockedFieldIds={lockedFieldIds}
        requiredFieldIds={requiredFieldIds}
        visibilityRules={visibilityRules}
        fieldSizes={fieldSizes}
        fieldLayoutConfig={fieldLayoutConfig}
        activePanelId={activePanelId}
        values={values}
        errors={{}}
        onChange={() => {}}
        readOnly
      />
    </div>
  );
}
