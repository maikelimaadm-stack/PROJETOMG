import React from "react";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";
import { ENTIDADES_RELACIONAIS } from "./empFieldConfigOptions";

function Field({ label, children }) {
  return <div className="grid grid-cols-[190px_minmax(0,1fr)] items-center gap-1"><label className="text-[12px] text-[#1a1f26] text-right leading-none">{label}:</label><div className="h-6 border-[0.5px] border-[#c5ced8] rounded-[2px] bg-white focus-within:border-[#2899f5] transition-colors overflow-visible [&_input]:h-[22px] [&_input]:border-0 [&_input]:rounded-none [&_input]:shadow-none [&_input]:focus-visible:ring-0 [&_.erp-field-select-chevron-btn]:h-[22px] [&_.emp-form-lookup-btn]:min-h-[22px]">{children}</div></div>;
}

export default function EmpRelationConfig({ form, updateForm, mode = "select" }) {
  const entity = mode === "relation" ? form.relation_entity : form.options_source_entity;
  const selectedEntity = ENTIDADES_RELACIONAIS.find((item) => item.value === entity);
  const displayField = mode === "relation" ? form.relation_display_field : form.options_label_field;
  const title = mode === "relation" ? "Cadastro relacionado" : "Lista do sistema";

  const handleEntityChange = (value) => {
    const next = value === "none" ? "" : value;
    const firstField = ENTIDADES_RELACIONAIS.find((item) => item.value === next)?.fields?.[0] || "nome";
    if (mode === "relation") { updateForm("relation_entity", next); updateForm("relation_display_field", firstField); return; }
    updateForm("options_source_entity", next); updateForm("options_label_field", firstField); updateForm("options_value_field", "id");
  };

  return <><Field label={title}><EmpAutocomplete variant="select" items={ENTIDADES_RELACIONAIS.map((item) => ({ ...item, id: item.value }))} value={entity || ""} onChange={(value) => handleEntityChange(value || "")} placeholder="SELECIONE" displayField="label" searchFields={["label", "value"]} className="w-full h-full" inputClassName="border-0 shadow-none focus-visible:ring-0 bg-transparent h-[22px] text-xs uppercase" uppercaseDisplay={false} /></Field><div className="ml-[191px] border-[0.5px] border-[#c5ced8] rounded-[2px] bg-slate-50 px-2 py-1 text-xs text-[#1a1f26]">{selectedEntity ? `O sistema exibirá automaticamente: ${displayField}` : "Escolha um cadastro para o sistema configurar sozinho."}</div></>;
}