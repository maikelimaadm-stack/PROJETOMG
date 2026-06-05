import React from "react";
import { Textarea } from "@/shared/ui/textarea";
import ToggleSwitch from "@/shared/components/ToggleSwitch";

function Field({ label, children }) {
  return <div className="grid grid-cols-[190px_minmax(0,1fr)] items-center gap-1"><label className="text-[12px] text-[#1a1f26] text-right leading-none">{label}:</label>{children}</div>;
}

export default function EmpMaskConfig({ form, updateForm }) {
  if (form.tipo !== "number") return null;
  return (
    <>
      <Field label="Usar máscara"><div className="h-6 flex items-center px-1"><ToggleSwitch className="emp-form-toggle-switch" checkedClassName="emp-form-toggle-switch-on" checked={!!form.usar_mascara} onChange={(checked) => updateForm("usar_mascara", checked)} /></div></Field>
      {form.usar_mascara && <div className="grid grid-cols-[190px_minmax(0,1fr)] items-start gap-1"><label className="text-[12px] text-[#1a1f26] text-right leading-none pt-1">Máscaras:</label><div className="min-h-[72px] border-[0.5px] border-[#c5ced8] rounded-[2px] bg-white focus-within:border-[#2899f5] transition-colors overflow-hidden [&_textarea]:rounded-none [&_textarea]:border-0 [&_textarea]:shadow-none [&_textarea]:focus-visible:ring-0"><Textarea value={form.mascaras_text || ""} onChange={(event) => updateForm("mascaras_text", event.target.value)} placeholder="(##) #####-####&#10;###.###.###-##&#10;##.###.###/####-##" className="w-full min-h-[70px] resize-none bg-transparent px-2 py-1 text-xs outline-none" /></div></div>}
      {form.usar_mascara && <div className="ml-[191px] border-[0.5px] border-[#c5ced8] rounded-[2px] bg-slate-50 px-2 py-1 text-xs text-[#1a1f26]">Use # para cada número. Cadastre uma máscara por linha; o sistema escolhe conforme a quantidade de dígitos.</div>}
    </>
  );
}