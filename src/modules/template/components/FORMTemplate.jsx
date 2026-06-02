import React, { useState } from "react";
import EmpRecordToolbar from "@/framework/cadastro/toolbars/EmpRecordToolbar";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";

export default function FORMTemplate({ onSubmit, onCancel }) {
  const [state, setState] = useState({ nome: "", status: "Ativo" });

  return (
    <div className="cadastro-emp-scope h-full min-h-0 overflow-hidden flex flex-col">
      <EmpSplitToolbarLayout
        className="flex-1"
        toolbar={
          <EmpRecordToolbar
            title="Template de Cadastro"
            operationLabel="Exemplo"
            badgeLabel="TEMPLATE"
            showSaveActions
            onSave={() => onSubmit?.(state)}
            onCancel={onCancel}
          />
        }
      >
        <div className="form-scroll-container h-full min-h-0 flex-1 overflow-auto p-3 space-y-3">
        <label className="text-xs text-slate-700 flex flex-col gap-1">
          Nome
          <input
            className="h-9 px-2 border border-slate-300 text-sm"
            value={state.nome}
            onChange={(event) => setState((prev) => ({ ...prev, nome: event.target.value }))}
          />
        </label>
        </div>
      </EmpSplitToolbarLayout>
    </div>
  );
}

