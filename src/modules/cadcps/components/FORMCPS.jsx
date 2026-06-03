import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";
import ToggleSwitch from "@/shared/components/ToggleSwitch";
import EmpCalculationBuilder from "@/framework/cadastro/fields/EmpCalculationBuilder";
import { montarFormulaVisual } from "@/framework/cadastro/fields/empFieldConfigOptions";
import LegacyRecordToolbar from "@/framework/cadastro/toolbars/EmpRecordToolbar";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";
import { CADCPS_APLICACAO, CADCPS_TIPOS } from "@/modules/cadcps/config/cadcpsConstants";
import repCps from "@/modules/cadcps/repositories/repCps";

const toSnake = (v) =>
  String(v || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const emptyForm = () => ({
  nome: "",
  field_name: "",
  descricao: "",
  ativo: true,
  tipo: "texto",
  tela_ids: [],
  aplicacao_modo: CADCPS_APLICACAO.TODAS,
  empresa_ids: [],
  obrigatorio: false,
  read_only: false,
  visivel_form: true,
  visivel_tabela: false,
  visivel_relatorio: false,
  pesquisavel: true,
  filtravel: true,
  exportavel: true,
  auditavel: true,
  placeholder: "",
  formula: "",
  calculation_builder: { items: [{ field: "", operator: "*" }, { field: "", operator: "*" }] },
  usar_mascara: false,
  mascaras_text: "",
  usar_decimal: false,
  decimal_places: 2,
  separador_decimal: ",",
  separador_milhar: ".",
  relation_entity: "",
  opcoes: [],
  opcoesDraft: "",
});

const FieldRow = ({ label, children, wide }) => (
  <div className={`grid grid-cols-[160px_minmax(0,1fr)] items-center gap-2 ${wide ? "md:col-span-2" : ""}`}>
    <label className="text-right text-[12px] text-[#1a1f26]">{label}</label>
    <div>{children}</div>
  </div>
);

export default function FORMCPS({
  initialData,
  isEditing,
  recordKey,
  telas: telasProp = [],
  empresas = [],
  formulaFields = [],
  onSubmit,
  onCancel,
  onToggleView,
  total = 0,
  currentIndex = 0,
  onNew,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onDelete,
  onDuplicate,
  searchValue = "",
  onSearchChange,
}) {
  const isDuplicating = !!initialData?._isDuplicate;
  const [editMode, setEditMode] = useState(!isEditing || isDuplicating);
  const [form, setForm] = useState(emptyForm);
  const previousRecordKeyRef = useRef(recordKey);

  const { data: telasQuery = [] } = useQuery({
    queryKey: ["cadcps-telas"],
    queryFn: () => repCps.listTelas(),
    staleTime: 60_000,
  });
  const telas = telasProp.length ? telasProp : telasQuery;

  const mapItemToForm = (item) => {
    if (!item) return emptyForm();
    return {
      ...emptyForm(),
      ...item,
      tela_ids: (item.telas || []).map((t) => t.id),
      empresa_ids: item.empresa_ids || [],
      opcoes: item.opcoes || [],
      opcoesDraft: (item.opcoes || []).map((o) => o.descricao).join("\n"),
      calculation_builder: item.calculation_builder || emptyForm().calculation_builder,
    };
  };

  useEffect(() => {
    const isRecordNavigation =
      isEditing &&
      !initialData?._isDuplicate &&
      previousRecordKeyRef.current &&
      recordKey &&
      previousRecordKeyRef.current !== recordKey &&
      recordKey !== "new" &&
      recordKey !== "duplicate";
    previousRecordKeyRef.current = recordKey;
    setForm(mapItemToForm(initialData));
    setEditMode(!isEditing || !!initialData?._isDuplicate);
    if (!isRecordNavigation && !initialData) {
      setEditMode(true);
    }
  }, [recordKey, initialData?.id, initialData?.updatedAt, initialData?._isDuplicate, isEditing]);

  const isReadOnly = isEditing && !isDuplicating && !editMode;

  const listaTipos = useMemo(
    () => ["lista", "lista_multipla"].includes(form.tipo),
    [form.tipo]
  );

  const update = (key, value) => {
    if (isReadOnly) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTela = (telaId) => {
    setForm((prev) => ({
      ...prev,
      tela_ids: prev.tela_ids.includes(telaId)
        ? prev.tela_ids.filter((id) => id !== telaId)
        : [...prev.tela_ids, telaId],
    }));
  };

  const toggleEmpresa = (empresaId) => {
    setForm((prev) => ({
      ...prev,
      empresa_ids: prev.empresa_ids.includes(empresaId)
        ? prev.empresa_ids.filter((id) => id !== empresaId)
        : [...prev.empresa_ids, empresaId],
    }));
  };

  const buildPayload = () => {
    const opcoes = listaTipos
      ? String(form.opcoesDraft || "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((descricao, index) => ({
            codigo: toSnake(descricao) || `opt_${index + 1}`,
            descricao,
            ordem: index,
            ativo: true,
          }))
      : form.opcoes;

    return {
      nome: form.nome,
      field_name: form.field_name || toSnake(form.nome),
      descricao: form.descricao,
      tipo: form.tipo,
      ativo: form.ativo,
      tela_ids: form.tela_ids,
      aplicacao_modo: form.aplicacao_modo,
      empresa_ids:
        form.aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS ? form.empresa_ids : [],
      obrigatorio: form.obrigatorio,
      read_only: form.read_only,
      visivel_form: form.visivel_form,
      visivel_tabela: form.visivel_tabela,
      visivel_relatorio: form.visivel_relatorio,
      pesquisavel: form.pesquisavel,
      filtravel: form.filtravel,
      exportavel: form.exportavel,
      auditavel: form.auditavel,
      placeholder: form.placeholder,
      formula:
        form.tipo === "formula"
          ? montarFormulaVisual(form.calculation_builder?.items || [])
          : null,
      calculation_builder: form.calculation_builder,
      usar_mascara: form.usar_mascara,
      mascaras_text: form.mascaras_text,
      usar_decimal: ["decimal", "moeda", "percentual"].includes(form.tipo) || form.usar_decimal,
      decimal_places: form.decimal_places,
      separador_decimal: form.separador_decimal,
      separador_milhar: form.separador_milhar,
      relation_entity: form.tipo === "relacao" ? form.relation_entity : null,
      opcoes,
    };
  };

  const handleSubmit = (event) => {
    event?.preventDefault?.();
    if (!form.nome.trim()) return;
    if (form.tela_ids.length === 0) return;
    if (form.aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS && form.empresa_ids.length === 0) return;
    onSubmit?.(buildPayload());
    setEditMode(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <EmpSplitToolbarLayout
        className="h-full min-h-0 flex-1"
        toolbar={
          <LegacyRecordToolbar
            showSaveActions={editMode}
            showEditAction={isReadOnly}
            showDeleteDuplicateActions={isEditing && !editMode && !isDuplicating}
            showUtilityActions={false}
            showRecordNavigation={isEditing && !editMode && !isDuplicating}
            onSave={handleSubmit}
            onCancel={onCancel}
            onEditRecord={() => setEditMode(true)}
            onToggleView={onToggleView}
            total={total}
            currentIndex={currentIndex}
            onNew={onNew}
            onFirst={onFirst}
            onPrevious={onPrevious}
            onNext={onNext}
            onLast={onLast}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            showSearch
          />
        }
      >
      <div className="form-scroll-container min-h-0 flex-1 overflow-auto p-4 pb-6">
        <div className="grid gap-4 md:grid-cols-2">
          <section className="space-y-2 rounded border border-[#dce3eb] p-3">
            <h3 className="text-xs font-semibold uppercase text-slate-600">Informações básicas</h3>
            <FieldRow label="Código">
              <Input value={initialData?.codigo ?? "Automático"} readOnly className="h-7 text-xs" />
            </FieldRow>
            <FieldRow label="Nome do Campo">
              <Input
                value={form.nome}
                onChange={(e) => {
                  const nome = e.target.value;
                  update("nome", nome);
                  if (!initialData?.id || isDuplicating) update("field_name", toSnake(nome));
                }}
                className="h-7 text-xs"
              />
            </FieldRow>
            <FieldRow label="Nome técnico">
              <Input
                value={form.field_name}
                onChange={(e) => update("field_name", e.target.value)}
                className="h-7 text-xs"
                readOnly={!!initialData?.id && !isDuplicating}
              />
            </FieldRow>
            <FieldRow label="Descrição" wide>
              <Textarea
                value={form.descricao}
                onChange={(e) => update("descricao", e.target.value)}
                className="min-h-[60px] text-xs"
              />
            </FieldRow>
            <FieldRow label="Ativo">
              <ToggleSwitch checked={form.ativo} onChange={(v) => update("ativo", v)} />
            </FieldRow>
          </section>

          <section className="space-y-2 rounded border border-[#dce3eb] p-3">
            <h3 className="text-xs font-semibold uppercase text-slate-600">Tipo</h3>
            <select
              value={form.tipo}
              onChange={(e) => update("tipo", e.target.value)}
              className="h-8 w-full rounded border border-[#c5ced8] px-2 text-xs"
            >
              {CADCPS_TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </section>

          <section className="space-y-2 rounded border border-[#dce3eb] p-3 md:col-span-2">
            <h3 className="text-xs font-semibold uppercase text-slate-600">Telas (múltipla seleção)</h3>
            <div className="flex flex-wrap gap-2">
              {telas.map((tela) => (
                <label
                  key={tela.id}
                  className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#dce3eb] px-2 py-1 text-xs"
                >
                  <Checkbox
                    checked={form.tela_ids.includes(tela.id)}
                    onCheckedChange={() => toggleTela(tela.id)}
                  />
                  {tela.nome}
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-2 rounded border border-[#dce3eb] p-3 md:col-span-2">
            <h3 className="text-xs font-semibold uppercase text-slate-600">Aplicação por empresa</h3>
            <div className="flex gap-4 text-xs">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  checked={form.aplicacao_modo === CADCPS_APLICACAO.TODAS}
                  onChange={() => update("aplicacao_modo", CADCPS_APLICACAO.TODAS)}
                />
                Todas as empresas
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  checked={form.aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS}
                  onChange={() => update("aplicacao_modo", CADCPS_APLICACAO.ESPECIFICAS)}
                />
                Empresas específicas
              </label>
            </div>
            {form.aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS ? (
              <div className="max-h-48 overflow-auto rounded border border-[#dce3eb]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-1 text-left">Sel.</th>
                      <th className="p-1 text-left">Código</th>
                      <th className="p-1 text-left">Nome Empresa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empresas.map((emp) => (
                      <tr key={emp.id} className="border-t border-[#eceff3]">
                        <td className="p-1">
                          <Checkbox
                            checked={form.empresa_ids.includes(String(emp.id))}
                            onCheckedChange={() => toggleEmpresa(String(emp.id))}
                          />
                        </td>
                        <td className="p-1">{emp.codempresa}</td>
                        <td className="p-1">{emp.nome_empresa || emp.razao_social}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>

          <section className="space-y-2 rounded border border-[#dce3eb] p-3 md:col-span-2">
            <h3 className="text-xs font-semibold uppercase text-slate-600">Configurações gerais</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {[
                ["obrigatorio", "Obrigatório"],
                ["read_only", "Somente leitura"],
                ["visivel_form", "Exibir formulário"],
                ["visivel_tabela", "Exibir tabela"],
                ["visivel_relatorio", "Exibir relatório"],
                ["pesquisavel", "Pesquisável"],
                ["filtravel", "Filtrável"],
                ["exportavel", "Exportável"],
                ["auditavel", "Auditável"],
              ].map(([key, label]) => (
                <label key={key} className="inline-flex items-center gap-2 text-xs">
                  <ToggleSwitch checked={form[key]} onChange={(v) => update(key, v)} />
                  {label}
                </label>
              ))}
            </div>
          </section>

          {(form.tipo === "decimal" || form.tipo === "moeda" || form.tipo === "percentual") && (
            <section className="space-y-2 rounded border border-[#dce3eb] p-3">
              <h3 className="text-xs font-semibold uppercase text-slate-600">Configurações numéricas</h3>
              <FieldRow label="Casas decimais">
                <Input
                  type="number"
                  min={0}
                  max={6}
                  value={form.decimal_places}
                  onChange={(e) => update("decimal_places", Number(e.target.value))}
                  className="h-7 w-20 text-xs"
                />
              </FieldRow>
              <FieldRow label="Sep. decimal">
                <Input
                  value={form.separador_decimal}
                  onChange={(e) => update("separador_decimal", e.target.value)}
                  className="h-7 w-16 text-xs"
                />
              </FieldRow>
              <FieldRow label="Sep. milhar">
                <Input
                  value={form.separador_milhar}
                  onChange={(e) => update("separador_milhar", e.target.value)}
                  className="h-7 w-16 text-xs"
                />
              </FieldRow>
            </section>
          )}

          <section className="space-y-2 rounded border border-[#dce3eb] p-3">
            <h3 className="text-xs font-semibold uppercase text-slate-600">Máscara</h3>
            <label className="inline-flex items-center gap-2 text-xs">
              <ToggleSwitch checked={form.usar_mascara} onChange={(v) => update("usar_mascara", v)} />
              Ativar máscara
            </label>
            {form.usar_mascara ? (
              <Textarea
                value={form.mascaras_text}
                onChange={(e) => update("mascaras_text", e.target.value)}
                placeholder={"CPF\n###.###.###-##\n\nTelefone\n(##) #####-####"}
                className="min-h-[100px] text-xs font-mono"
              />
            ) : null}
          </section>

          {listaTipos ? (
            <section className="space-y-2 rounded border border-[#dce3eb] p-3 md:col-span-2">
              <h3 className="text-xs font-semibold uppercase text-slate-600">Opções da lista</h3>
              <Textarea
                value={form.opcoesDraft}
                onChange={(e) => update("opcoesDraft", e.target.value)}
                placeholder="Uma opção por linha"
                className="min-h-[120px] text-xs"
              />
            </section>
          ) : null}

          {form.tipo === "relacao" ? (
            <section className="space-y-2 rounded border border-[#dce3eb] p-3">
              <h3 className="text-xs font-semibold uppercase text-slate-600">Relação</h3>
              <select
                value={form.relation_entity}
                onChange={(e) => update("relation_entity", e.target.value)}
                className="h-8 w-full rounded border border-[#c5ced8] px-2 text-xs"
              >
                <option value="">Selecione...</option>
                {telas.map((t) => (
                  <option key={t.id} value={t.entity_name}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </section>
          ) : null}

          {form.tipo === "formula" ? (
            <section className="space-y-2 rounded border border-[#dce3eb] p-3 md:col-span-2">
              <h3 className="text-xs font-semibold uppercase text-slate-600">Fórmula</h3>
              <EmpCalculationBuilder
                value={form.calculation_builder?.items || []}
                fields={formulaFields}
                onChange={(items) => update("calculation_builder", { items })}
              />
            </section>
          ) : null}
        </div>
      </div>
      </EmpSplitToolbarLayout>
    </form>
  );
}
