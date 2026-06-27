import React from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";
import ToggleSwitch from "@/shared/components/ToggleSwitch";
import EmpCalculationBuilder from "@/framework/cadastro/fields/EmpCalculationBuilder";
import { montarFormulaVisual } from "@/framework/cadastro/fields/empFieldConfigOptions";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";
import { CADCPS_APLICACAO, CADCPS_TIPOS } from "@/modules/cadcps/config/cadcpsConstants.js";
import {
  buildEmptyCadcpsForm,
  CPS_INPUT_CLASS,
} from "@/modules/cadcps/config/cpsForm.constants.js";

const toSnake = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

function CpsToggleRow({ label, checked, onChange, disabled }) {
  return (
    <div className="grid grid-cols-[170px_minmax(0,1fr)] items-center gap-1">
      <label className="text-right text-[12px] leading-none text-[#1a1f26]">{label}:</label>
      <div className="emp-form-field-bare flex min-h-[var(--emp-form-control-height)] max-w-[480px] items-center">
        <ToggleSwitch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="emp-form-toggle-switch"
          checkedClassName="emp-form-toggle-switch-on"
        />
      </div>
    </div>
  );
}

export const mapCadcpsRecordToForm = (item) => {
  if (!item) return buildEmptyCadcpsForm();
  return {
    ...buildEmptyCadcpsForm(),
    ...item,
    tela_id: item.telas?.[0]?.id ? String(item.telas[0].id) : item.tela_id ? String(item.tela_id) : "",
    empresa_ids: (item.empresa_ids || []).map(String),
    opcoes: item.opcoes || [],
    opcoesDraft: (item.opcoes || []).map((option) => option.descricao).join("\n"),
    calculation_builder: item.calculation_builder || buildEmptyCadcpsForm().calculation_builder,
  };
};

export const validateCadcpsFormExtra = (formData) => {
  const errors = {};
  if (!formData.tela_id) errors.tela_id = true;
  if (!String(formData.nome || "").trim()) errors.nome = true;
  if (
    formData.aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS &&
    (!formData.empresa_ids || formData.empresa_ids.length === 0)
  ) {
    errors.empresa_ids = true;
  }
  if (Object.keys(errors).length === 0) {
    return { valid: true, errors: {} };
  }
  return {
    valid: false,
    errors,
    focusPanelId: errors.empresa_ids ? "aplicacao" : errors.tela_id ? "principais" : "principais",
  };
};

export const prepareCadcpsSubmitPayload = (form) => {
  const listaTipos = ["lista", "lista_multipla"].includes(form.tipo);
  const showNumericConfig = ["decimal", "moeda", "percentual"].includes(form.tipo);

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

  const { opcoesDraft: _draft, ...rest } = form;

  return {
    ...rest,
    nome: form.nome,
    field_name: form.field_name || toSnake(form.nome),
    descricao: form.descricao,
    tipo: form.tipo,
    ativo: form.ativo,
    tela_id: form.tela_id,
    aplicacao_modo: form.aplicacao_modo,
    empresa_ids:
      form.aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS
        ? (form.empresa_ids || []).map(String)
        : [],
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

export function buildCadcpsDynamicFields({
  formData,
  handleChange,
  isReadOnly,
  initialData,
  isEditing,
  isDuplicating,
  formResources = {},
}) {
  const {
    telas = [],
    telasLoading = false,
    refetchTelas,
    empresas = [],
    formulaFields = [],
  } = formResources;

  const lockTela = isEditing && !!initialData?.id && !isDuplicating;
  const listaTipos = ["lista", "lista_multipla"].includes(formData.tipo);
  const showNumericConfig = ["decimal", "moeda", "percentual"].includes(formData.tipo);
  const showMaskConfig = formData.tipo === "texto";

  const toggleEmpresa = (empresaId) => {
    if (isReadOnly) return;
    const ids = formData.empresa_ids || [];
    handleChange(
      "empresa_ids",
      ids.includes(empresaId) ? ids.filter((id) => id !== empresaId) : [...ids, empresaId]
    );
  };

  const fields = [
    {
      id: "codigo",
      name: "codigo",
      label: "Código",
      type: "text",
      readOnly: true,
      render: () => (
        <Input
          value={initialData?._isPersisting ? "Gerando..." : initialData?.codigo ?? "Automático"}
          readOnly
          className={CPS_INPUT_CLASS}
        />
      ),
    },
    {
      id: "tela_id",
      name: "tela_id",
      label: "Tela",
      type: "select",
      required: true,
      errorKey: "tela_id",
      render: () =>
        telasLoading ? (
          <span className="px-2 text-xs text-slate-500">Carregando telas...</span>
        ) : telas.length === 0 ? (
          <div className="flex min-h-[var(--emp-form-control-height)] flex-col justify-center gap-1 px-2 text-xs text-amber-800">
            <span>Nenhuma tela disponível.</span>
            <button
              type="button"
              className="w-fit rounded border border-[#c5ced8] bg-white px-2 py-0.5"
              onClick={() => void refetchTelas?.()}
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <EmpAutocomplete
            variant="select"
            items={telas.map((tela) => ({
              id: String(tela.id),
              nome: String(tela.nome || "").toUpperCase(),
            }))}
            value={formData.tela_id ? String(formData.tela_id) : ""}
            onChange={(next) => handleChange("tela_id", next || "")}
            placeholder="SELECIONE A TELA"
            displayField="nome"
            searchFields={["nome"]}
            disabled={isReadOnly || lockTela}
            readOnly={isReadOnly || lockTela}
            className="w-full h-full"
            inputClassName={CPS_INPUT_CLASS}
          />
        ),
    },
    {
      id: "nome",
      name: "nome",
      label: "Nome do campo",
      type: "text",
      required: true,
      errorKey: "nome",
      uppercase: true,
      render: () => (
        <Input
          value={formData.nome || ""}
          onChange={(event) => {
            const nome = event.target.value;
            handleChange("nome", nome);
            if (!initialData?.id || isDuplicating) handleChange("field_name", toSnake(nome));
          }}
          readOnly={isReadOnly}
          className={CPS_INPUT_CLASS}
          placeholder="NOME DO CAMPO"
        />
      ),
    },
    {
      id: "field_name",
      name: "field_name",
      label: "Nome técnico",
      type: "text",
      uppercase: true,
      render: () => (
        <Input
          value={formData.field_name || ""}
          onChange={(event) => handleChange("field_name", event.target.value)}
          readOnly={isReadOnly || (!!initialData?.id && !isDuplicating)}
          className={CPS_INPUT_CLASS}
          placeholder="NOME_TECNICO"
        />
      ),
    },
    {
      id: "tipo",
      name: "tipo",
      label: "Tipo do campo",
      type: "select",
      required: true,
      render: () => (
        <EmpAutocomplete
          variant="select"
          items={CADCPS_TIPOS.map((tipo) => ({
            id: tipo.value,
            nome: String(tipo.label || "").toUpperCase(),
          }))}
          value={formData.tipo || ""}
          onChange={(next) => handleChange("tipo", next || "texto")}
          placeholder="SELECIONE"
          displayField="nome"
          searchFields={["nome"]}
          disabled={isReadOnly}
          readOnly={isReadOnly}
          className="w-full h-full"
          inputClassName={CPS_INPUT_CLASS}
        />
      ),
    },
    {
      id: "ativo",
      name: "ativo",
      label: "Ativo",
      type: "toggle",
      render: () => (
        <CpsToggleRow
          label="Ativo"
          checked={!!formData.ativo}
          onChange={(value) => handleChange("ativo", value)}
          disabled={isReadOnly}
        />
      ),
    },
    {
      id: "aplicacao_modo",
      name: "aplicacao_modo",
      label: "Modo de aplicação",
      type: "radio",
      render: () => (
        <div className="flex min-h-[var(--emp-form-control-height)] flex-col justify-center gap-2 px-2 text-xs">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={formData.aplicacao_modo === CADCPS_APLICACAO.TODAS}
              onChange={() => handleChange("aplicacao_modo", CADCPS_APLICACAO.TODAS)}
              disabled={isReadOnly}
            />
            Todas as empresas
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={formData.aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS}
              onChange={() => handleChange("aplicacao_modo", CADCPS_APLICACAO.ESPECIFICAS)}
              disabled={isReadOnly}
            />
            Empresas específicas
          </label>
        </div>
      ),
    },
    {
      id: "empresa_ids",
      name: "empresa_ids",
      label: "Empresas",
      type: "custom",
      visible: formData.aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS,
      errorKey: "empresa_ids",
      render: () =>
        formData.aplicacao_modo === CADCPS_APLICACAO.ESPECIFICAS ? (
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
                        checked={(formData.empresa_ids || []).includes(String(emp.id))}
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
        ) : null,
    },
    {
      id: "placeholder",
      name: "placeholder",
      label: "Placeholder",
      type: "text",
      render: () => (
        <Input
          value={formData.placeholder || ""}
          onChange={(event) => handleChange("placeholder", event.target.value)}
          readOnly={isReadOnly}
          className={CPS_INPUT_CLASS}
          placeholder="TEXTO DE AJUDA"
        />
      ),
    },
    {
      id: "descricao",
      name: "descricao",
      label: "Descrição",
      type: "textarea",
      wide: true,
      render: () => (
        <Textarea
          value={formData.descricao || ""}
          onChange={(event) => handleChange("descricao", event.target.value)}
          readOnly={isReadOnly}
          className="emp-form-input min-h-[72px] w-full border-0 bg-white px-2 shadow-none focus-visible:ring-0 uppercase"
          placeholder="DESCRIÇÃO DO CAMPO"
        />
      ),
    },
    ...[
      ["obrigatorio", "Obrigatório"],
      ["read_only", "Somente leitura"],
      ["visivel_form", "Exibir no formulário"],
      ["visivel_tabela", "Exibir na tabela"],
      ["visivel_relatorio", "Exibir no relatório"],
      ["pesquisavel", "Pesquisável"],
      ["filtravel", "Filtrável"],
      ["exportavel", "Exportável"],
      ["auditavel", "Auditável"],
    ].map(([key, label]) => ({
      id: key,
      name: key,
      label,
      type: "toggle",
      render: () => (
        <CpsToggleRow
          label={label}
          checked={!!formData[key]}
          onChange={(value) => handleChange(key, value)}
          disabled={isReadOnly}
        />
      ),
    })),
  ];

  if (showNumericConfig) {
    fields.push(
      {
        id: "decimal_places",
        name: "decimal_places",
        label: "Casas decimais",
        type: "number",
        visible: true,
        render: () => (
          <Input
            type="number"
            min={0}
            max={6}
            value={formData.decimal_places}
            onChange={(event) => handleChange("decimal_places", Number(event.target.value))}
            readOnly={isReadOnly}
            className={CPS_INPUT_CLASS}
          />
        ),
      },
      {
        id: "separador_decimal",
        name: "separador_decimal",
        label: "Separador decimal",
        type: "text",
        render: () => (
          <Input
            value={formData.separador_decimal || ""}
            onChange={(event) => handleChange("separador_decimal", event.target.value)}
            readOnly={isReadOnly}
            className={CPS_INPUT_CLASS}
          />
        ),
      },
      {
        id: "separador_milhar",
        name: "separador_milhar",
        label: "Separador milhar",
        type: "text",
        render: () => (
          <Input
            value={formData.separador_milhar || ""}
            onChange={(event) => handleChange("separador_milhar", event.target.value)}
            readOnly={isReadOnly}
            className={CPS_INPUT_CLASS}
          />
        ),
      }
    );
  }

  if (showMaskConfig) {
    fields.push(
      {
        id: "usar_mascara",
        name: "usar_mascara",
        label: "Usar máscara",
        type: "toggle",
        render: () => (
          <CpsToggleRow
            label="Usar máscara"
            checked={!!formData.usar_mascara}
            onChange={(value) => handleChange("usar_mascara", value)}
            disabled={isReadOnly}
          />
        ),
      },
      {
        id: "mascaras_text",
        name: "mascaras_text",
        label: "Máscaras",
        type: "textarea",
        visible: !!formData.usar_mascara,
        render: () =>
          formData.usar_mascara ? (
            <Textarea
              value={formData.mascaras_text || ""}
              onChange={(event) => handleChange("mascaras_text", event.target.value)}
              readOnly={isReadOnly}
              className="emp-form-input min-h-[120px] w-full border-0 bg-white px-2 font-mono text-xs shadow-none focus-visible:ring-0"
              placeholder={"CPF\n###.###.###-##"}
            />
          ) : null,
      }
    );
  }

  if (listaTipos) {
    fields.push({
      id: "opcoesDraft",
      name: "opcoesDraft",
      label: "Opções da lista",
      type: "textarea",
      wide: true,
      render: () => (
        <Textarea
          value={formData.opcoesDraft || ""}
          onChange={(event) => handleChange("opcoesDraft", event.target.value)}
          readOnly={isReadOnly}
          className="emp-form-input min-h-[120px] w-full border-0 bg-white px-2 text-xs shadow-none focus-visible:ring-0"
        />
      ),
    });
  }

  if (formData.tipo === "relacao") {
    fields.push({
      id: "relation_entity",
      name: "relation_entity",
      label: "Cadastro relacionado",
      type: "select",
      render: () => (
        <EmpAutocomplete
          variant="select"
          items={telas.map((tela) => ({
            id: String(tela.entity_name || ""),
            nome: String(tela.nome || "").toUpperCase(),
          }))}
          value={formData.relation_entity || ""}
          onChange={(next) => handleChange("relation_entity", next || "")}
          placeholder="SELECIONE"
          displayField="nome"
          searchFields={["nome"]}
          disabled={isReadOnly}
          readOnly={isReadOnly}
          className="w-full h-full"
          inputClassName={CPS_INPUT_CLASS}
        />
      ),
    });
  }

  if (formData.tipo === "formula") {
    fields.push({
      id: "calculation_builder",
      name: "calculation_builder",
      label: "Construtor de fórmula",
      type: "custom",
      wide: true,
      render: () => (
        <div className="w-full max-w-[640px] rounded border border-[#c5ced8] bg-white p-2">
          <EmpCalculationBuilder
            value={formData.calculation_builder?.items || []}
            fields={formulaFields}
            onChange={(items) => handleChange("calculation_builder", { items })}
          />
        </div>
      ),
    });
  }

  return fields.filter((field) => field.visible !== false);
}

export default buildCadcpsDynamicFields;
