import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  ErpFloatingInput,
  ErpFloatingSelect,
  ErpFloatingSwitch,
  ErpFloatingTextarea,
  ErpFormGrid,
} from "@/shared/forms";
import EmpCalculationBuilder from "@/framework/cadastro/fields/EmpCalculationBuilder";
import { montarFormulaVisual } from "@/framework/cadastro/fields/empFieldConfigOptions";
import LegacyRecordToolbar from "@/framework/cadastro/toolbars/EmpRecordToolbar";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";
import LegacyTabs from "@/framework/cadastro/toolbars/EmpTabs";
import { reportRequiredFieldErrors, clearRequiredFieldErrors } from "@/shared/feedback";
import { useErpPageHeader } from "@/shared/layouts/ErpPageHeaderContext";
import { CADCPS_APLICACAO, CADCPS_TIPOS } from "@/modules/cadcps/config/cadcpsConstants";
import { CPS_FORM_PANELS } from "@/modules/cadcps/config/formCps.constants";
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
  tela_id: "",
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
  const [activeTab, setActiveTab] = useState("configuracoes");
  const [form, setForm] = useState(emptyForm);
  const previousRecordKeyRef = useRef(recordKey);
  const { setPageHeader, clearPageHeader } = useErpPageHeader();

  const {
    data: telasQuery = [],
    isLoading: telasLoading,
    refetch: refetchTelas,
  } = useQuery({
    queryKey: ["cadcps-telas"],
    queryFn: () => repCps.listTelas(),
    staleTime: 30_000,
  });

  const telas = telasProp.length ? telasProp : telasQuery;

  const mapItemToForm = (item) => {
    if (!item) return emptyForm();
    return {
      ...emptyForm(),
      ...item,
      tela_id: item.telas?.[0]?.id || "",
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
      setActiveTab("configuracoes");
    }
  }, [recordKey, initialData?.id, initialData?.updatedAt, initialData?._isDuplicate, isEditing]);

  const isReadOnly = isEditing && !isDuplicating && !editMode;
  const lockTela = isEditing && !!initialData?.id && !isDuplicating;

  const update = (key, value) => {
    if (isReadOnly) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleEmpresa = (empresaId) => {
    if (isReadOnly) return;
    setForm((prev) => ({
      ...prev,
      empresa_ids: prev.empresa_ids.includes(empresaId)
        ? prev.empresa_ids.filter((id) => id !== empresaId)
        : [...prev.empresa_ids, empresaId],
    }));
  };

  const listaTipos = useMemo(
    () => ["lista", "lista_multipla"].includes(form.tipo),
    [form.tipo]
  );

  const showNumericConfig = useMemo(
    () => ["decimal", "moeda", "percentual"].includes(form.tipo),
    [form.tipo]
  );

  const showMaskConfig = useMemo(() => form.tipo === "texto", [form.tipo]);

  const telaOptions = useMemo(
    () => telas.map((tela) => ({ value: String(tela.id), label: tela.nome })),
    [telas]
  );

  const tipoOptions = useMemo(
    () => CADCPS_TIPOS.map((t) => ({ value: t.value, label: t.label })),
    []
  );

  const relationOptions = useMemo(
    () => telas.map((t) => ({ value: t.entity_name, label: t.nome })),
    [telas]
  );

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
      tela_id: form.tela_id,
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
      usar_decimal: showNumericConfig ? true : form.tipo === "inteiro" ? false : form.usar_decimal,
      decimal_places: form.decimal_places,
      separador_decimal: form.separador_decimal,
      separador_milhar: form.separador_milhar,
      relation_entity: form.tipo === "relacao" ? form.relation_entity : null,
      opcoes,
    };
  };

  const validateForm = () => {
    const errors = {};
    if (!form.tela_id) errors.tela_id = true;
    if (!form.nome.trim()) errors.nome = true;
    if (form.aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS && form.empresa_ids.length === 0) {
      errors.empresa_ids = true;
    }
    clearRequiredFieldErrors();
    if (Object.keys(errors).length === 0) return true;
    if (errors.empresa_ids) setActiveTab("aplicacao");
    reportRequiredFieldErrors(errors);
    return false;
  };

  const handleSubmit = (event) => {
    event?.preventDefault?.();
    if (isReadOnly) return;
    if (!validateForm()) return;
    onSubmit?.(buildPayload());
    setEditMode(false);
  };

  const operationLabel = isDuplicating
    ? "NOVO REGISTRO DUPLICADO"
    : isEditing
      ? editMode
        ? "EDIÇÃO DE REGISTRO"
        : "VISUALIZAÇÃO DE REGISTRO"
      : "NOVO REGISTRO";

  const recordHeaderTitle = useMemo(() => {
    const code = initialData?.codigo != null ? String(initialData.codigo) : "";
    const name = String(form.nome || "").trim();
    if (code && name) return `${code} - ${name}`;
    if (name) return name;
    if (!isEditing) return "Novo campo personalizado";
    return null;
  }, [initialData?.codigo, form.nome, isEditing]);

  useEffect(() => {
    setPageHeader({ recordTitle: recordHeaderTitle, operationLabel, contextSuffix: null });
    return () => clearPageHeader();
  }, [recordHeaderTitle, operationLabel, setPageHeader, clearPageHeader]);

  const renderPrincipal = () => (
    <fieldset
      className={`emp-form-fieldset m-0 min-w-0 border-0 p-0 ${isReadOnly ? "pointer-events-none opacity-90" : ""}`}
    >
      <ErpFormGrid columns={2} className="emp-form-fields">
        <ErpFloatingInput
          label="Código"
          value={initialData?.codigo ?? "Automático"}
          readOnly
          disabled
        />
        <div data-field="tela_id">
          {telasLoading ? (
            <p className="text-xs text-slate-500 py-3">Carregando telas...</p>
          ) : telas.length === 0 ? (
            <div className="flex flex-col gap-2 py-2 text-xs text-amber-800">
              <span>Nenhuma tela disponível.</span>
              <button
                type="button"
                className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-1 hover:bg-slate-50"
                onClick={() => void refetchTelas()}
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <ErpFloatingSelect
              label="Tela"
              required
              value={form.tela_id}
              onValueChange={(v) => update("tela_id", v)}
              options={telaOptions}
              disabled={isReadOnly || lockTela}
              readOnly={isReadOnly || lockTela}
            />
          )}
        </div>
        <div data-field="nome">
          <ErpFloatingInput
            label="Nome do campo"
            required
            value={form.nome}
            onChange={(e) => {
              const nome = e.target.value;
              update("nome", nome);
              if (!initialData?.id || isDuplicating) update("field_name", toSnake(nome));
            }}
            readOnly={isReadOnly}
          />
        </div>
        <ErpFloatingInput
          label="Nome técnico"
          value={form.field_name}
          onChange={(e) => update("field_name", e.target.value)}
          readOnly={isReadOnly || (!!initialData?.id && !isDuplicating)}
        />
        <ErpFloatingSelect
          label="Tipo do campo"
          required
          value={form.tipo}
          onValueChange={(v) => update("tipo", v)}
          options={tipoOptions}
          disabled={isReadOnly}
          readOnly={isReadOnly}
        />
        <ErpFloatingSwitch
          label="Ativo"
          checked={form.ativo}
          onChange={(v) => update("ativo", v)}
          disabled={isReadOnly}
        />
      </ErpFormGrid>
    </fieldset>
  );

  const renderConfiguracoes = () => (
    <fieldset className={`emp-form-fieldset m-0 min-w-0 border-0 p-0 ${isReadOnly ? "pointer-events-none" : ""}`}>
      <ErpFormGrid columns={2} className="emp-form-fields">
        <ErpFloatingInput
          label="Placeholder"
          value={form.placeholder}
          onChange={(e) => update("placeholder", e.target.value)}
          readOnly={isReadOnly}
        />
        <ErpFloatingTextarea
          label="Descrição"
          value={form.descricao}
          onChange={(e) => update("descricao", e.target.value)}
          readOnly={isReadOnly}
          className="erp-form-grid-span-2"
          rows={3}
        />
        {[
          ["obrigatorio", "Obrigatório"],
          ["read_only", "Somente leitura"],
          ["visivel_form", "Exibir no formulário"],
          ["visivel_tabela", "Exibir na tabela"],
          ["visivel_relatorio", "Exibir no relatório"],
          ["pesquisavel", "Pesquisável"],
          ["filtravel", "Filtrável"],
          ["exportavel", "Exportável"],
          ["auditavel", "Auditável"],
        ].map(([key, label]) => (
          <ErpFloatingSwitch
            key={key}
            label={label}
            checked={form[key]}
            onChange={(v) => update(key, v)}
            disabled={isReadOnly}
          />
        ))}
      </ErpFormGrid>
    </fieldset>
  );

  const renderAplicacao = () => (
    <fieldset className={`emp-form-fieldset m-0 min-w-0 border-0 p-0 ${isReadOnly ? "pointer-events-none" : ""}`}>
      <div className="emp-form-fields flex flex-col gap-2">
        <div className="erp-form-grid-span-2 max-w-[640px]">
          <p className="mb-2 text-xs font-medium text-slate-600">Modo de aplicação</p>
          <div className="flex min-h-[var(--emp-form-control-height)] flex-col justify-center gap-2 text-xs">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={form.aplicacao_modo === CADCPS_APLICACAO.TODAS}
                onChange={() => update("aplicacao_modo", CADCPS_APLICACAO.TODAS)}
                disabled={isReadOnly}
              />
              Todas as empresas
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={form.aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS}
                onChange={() => update("aplicacao_modo", CADCPS_APLICACAO.ESPECIFICAS)}
                disabled={isReadOnly}
              />
              Empresas específicas
            </label>
          </div>
        </div>
        {form.aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS ? (
          <div data-field="empresa_ids" className="erp-form-grid-span-2 w-full max-w-[640px]">
            <p className="mb-2 text-xs font-medium text-slate-600">Empresas</p>
            <div className="max-h-64 w-full max-w-[640px] overflow-auto rounded border border-[#c5ced8] bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-2 text-left">Sel.</th>
                    <th className="p-2 text-left">Código</th>
                    <th className="p-2 text-left">Nome</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((emp) => (
                    <tr key={emp.id} className="border-t border-[#eceff3]">
                      <td className="p-2">
                        <Checkbox
                          checked={form.empresa_ids.includes(String(emp.id))}
                          onCheckedChange={() => toggleEmpresa(String(emp.id))}
                          disabled={isReadOnly}
                        />
                      </td>
                      <td className="p-2">{emp.codempresa}</td>
                      <td className="p-2">{emp.nome_empresa || emp.razao_social}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </fieldset>
  );

  const renderTipo = () => (
    <fieldset className={`emp-form-fieldset m-0 min-w-0 border-0 p-0 ${isReadOnly ? "pointer-events-none" : ""}`}>
      <ErpFormGrid columns={2} className="emp-form-fields">
        {showNumericConfig ? (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Configuração numérica
            </p>
            <ErpFloatingInput
              label="Casas decimais"
              type="number"
              value={form.decimal_places}
              onChange={(e) => update("decimal_places", Number(e.target.value))}
              readOnly={isReadOnly}
            />
            <ErpFloatingInput
              label="Separador decimal"
              value={form.separador_decimal}
              onChange={(e) => update("separador_decimal", e.target.value)}
              readOnly={isReadOnly}
            />
            <ErpFloatingInput
              label="Separador milhar"
              value={form.separador_milhar}
              onChange={(e) => update("separador_milhar", e.target.value)}
              readOnly={isReadOnly}
            />
          </>
        ) : null}

        {showMaskConfig ? (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Máscara de entrada (CPF, CNPJ, telefone, etc.)
          </p>
        ) : null}
        {showMaskConfig ? (
          <ErpFloatingSwitch
            label="Usar máscara"
            checked={form.usar_mascara}
            onChange={(v) => update("usar_mascara", v)}
            disabled={isReadOnly}
          />
        ) : null}
        {showMaskConfig && form.usar_mascara ? (
          <ErpFloatingTextarea
            label="Máscaras"
            value={form.mascaras_text}
            onChange={(e) => update("mascaras_text", e.target.value)}
            readOnly={isReadOnly}
            className="erp-form-grid-span-2 font-mono text-xs"
            rows={5}
          />
        ) : null}

        {listaTipos ? (
          <ErpFloatingTextarea
            label="Opções da lista"
            value={form.opcoesDraft}
            onChange={(e) => update("opcoesDraft", e.target.value)}
            readOnly={isReadOnly}
            className="erp-form-grid-span-2"
            rows={5}
          />
        ) : null}

        {form.tipo === "relacao" ? (
          <ErpFloatingSelect
            label="Cadastro relacionado"
            value={form.relation_entity}
            onValueChange={(v) => update("relation_entity", v)}
            options={relationOptions}
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
        ) : null}

        {form.tipo === "formula" ? (
          <div className="erp-form-grid-span-2 w-full max-w-[640px]">
            <p className="mb-2 text-xs font-medium text-slate-600">Construtor de fórmula</p>
            <div className="rounded-lg border border-slate-200 bg-white p-2">
              <EmpCalculationBuilder
                value={form.calculation_builder?.items || []}
                fields={formulaFields}
                onChange={(items) => update("calculation_builder", { items })}
              />
            </div>
          </div>
        ) : null}
      </ErpFormGrid>
    </fieldset>
  );

  const panelContent = {
    aplicacao: renderAplicacao,
    configuracoes: renderConfiguracoes,
    tipo: renderTipo,
  };

  return (
    <div className="cadastro-emp-scope erp-ui flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
          <div className="form-scroll-container min-h-0 flex-1 overflow-auto pb-6 pr-2">
            <div className="emp-form-body flex flex-col">
              <div className="emp-form-section emp-form-section-principal w-full min-w-[920px] max-w-none pl-2 pr-4">
                {renderPrincipal()}
              </div>

              <div className="emp-form-panels-zone flex min-h-0 flex-1 flex-col">
                <LegacyTabs tabs={CPS_FORM_PANELS} activeTab={activeTab} onChange={setActiveTab} />
                <div className="emp-form-section emp-form-section-panel min-h-[380px] w-full min-w-[920px] max-w-none pl-2 pr-4">
                  {panelContent[activeTab]?.()}
                </div>
              </div>
            </div>
          </div>
        </EmpSplitToolbarLayout>
      </form>
    </div>
  );
}
