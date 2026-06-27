import React from "react";
import { Input } from "@/shared/ui/input";
import campoEngine from "@/framework/cadastro/fields/campoEngine";
import EmpFormImageField from "@/framework/cadastro/formularios/EmpFormImageField";
import EmpAutocomplete from "@/framework/cadastro/formularios/EmpAutocomplete";
import { MakCmdSelect } from "@/framework/mak/layout";

const OPCOES_TIPO_PESSOA = [
  { id: "PJ", nome: "PESSOA JURÍDICA (PJ)" },
  { id: "PF", nome: "PESSOA FÍSICA (PF)" },
];

const OPCOES_TIPO_VINCULO = [
  { id: "proprietario", nome: "PROPRIETÁRIO" },
  { id: "arrendatario", nome: "ARRENDATÁRIO" },
];

export function buildEmpresasDynamicFields(ctx) {
  const {
    formData,
    handleChange,
    isReadOnly,
    inputClass,
    initialData,
    hideToolbar,
    camposPersonalizadosForm = [],
    renderCampoPersonalizado = () => null,
    relatedOptions = {},
    uploadingLogo = false,
    handleLogoUpload,
    estados = [],
  } = ctx;

  const opcoesEstado = estados.map((item) => ({ id: item, nome: item }));

  const renderTipoPessoaSelect = () =>
    hideToolbar ? (
      <MakCmdSelect
        label="Tipo de Pessoa"
        required
        value={formData.tipo_pessoa || "PJ"}
        options={OPCOES_TIPO_PESSOA.map((item) => ({
          value: item.id,
          label: item.id === "PJ" ? "Pessoa Jurídica" : "Pessoa Física",
        }))}
        onChange={(next) => handleChange("tipo_pessoa", next || "PJ")}
        disabled={isReadOnly}
      />
    ) : (
      <EmpAutocomplete
        variant="select"
        items={OPCOES_TIPO_PESSOA}
        value={formData.tipo_pessoa || "PJ"}
        onChange={(next) => handleChange("tipo_pessoa", next || "PJ")}
        placeholder="SELECIONE"
        displayField="nome"
        searchFields={["nome"]}
        disabled={isReadOnly}
        readOnly={isReadOnly}
        className="w-full min-w-0"
        inputClassName={`${inputClass} border-0 shadow-none focus-visible:ring-0 bg-white uppercase`}
      />
    );

  const renderTipoVinculoSelect = () =>
    hideToolbar ? (
      <MakCmdSelect
        label="Proprietário/Arrendatário"
        value={formData.tipo_vinculo || ""}
        options={OPCOES_TIPO_VINCULO.map((item) => ({
          value: item.id,
          label: item.id === "proprietario" ? "Proprietário" : "Arrendatário",
        }))}
        onChange={(next) => handleChange("tipo_vinculo", next || "")}
        disabled={isReadOnly}
      />
    ) : (
      <EmpAutocomplete
        variant="select"
        items={OPCOES_TIPO_VINCULO}
        value={formData.tipo_vinculo || ""}
        onChange={(next) => handleChange("tipo_vinculo", next || "")}
        placeholder="SELECIONE"
        displayField="nome"
        searchFields={["nome"]}
        disabled={isReadOnly}
        readOnly={isReadOnly}
        className="w-full min-w-0"
        inputClassName={`${inputClass} border-0 shadow-none focus-visible:ring-0 bg-white uppercase`}
      />
    );

  const renderStatusSelect = () =>
    hideToolbar ? (
      <MakCmdSelect
        label="Ativa"
        value={formData.status || "Ativa"}
        options={[
          { value: "Ativa", label: "Ativa" },
          { value: "Inativa", label: "Inativa" },
        ]}
        onChange={(next) => handleChange("status", next || "Ativa")}
        disabled={isReadOnly}
      />
    ) : (
      <EmpAutocomplete
        variant="select"
        items={[
          { id: "Ativa", nome: "ATIVA" },
          { id: "Inativa", nome: "INATIVA" },
        ]}
        value={formData.status || "Ativa"}
        onChange={(next) => handleChange("status", next || "Ativa")}
        placeholder="SELECIONE"
        displayField="nome"
        searchFields={["nome"]}
        disabled={isReadOnly}
        readOnly={isReadOnly}
        className="w-full min-w-0"
        inputClassName={`${inputClass} border-0 shadow-none focus-visible:ring-0 bg-white uppercase`}
      />
    );

  return [
    {
      id: "tipo_pessoa",
      name: "tipo_pessoa",
      label: "Tipo de Pessoa",
      type: "select",
      required: true,
      compact: true,
      errorKey: "tipo_pessoa",
      render: renderTipoPessoaSelect,
    },
    {
      id: "tipo_vinculo",
      name: "tipo_vinculo",
      label: "Proprietário/Arrendatário",
      type: "select",
      compact: true,
      render: renderTipoVinculoSelect,
    },
    {
      id: "codempresa",
      name: "codempresa",
      label: "Cód. Empresa",
      type: "text",
      widthType: "CODIGO",
      compact: true,
      readOnly: true,
      render: () =>
        hideToolbar ? (
          <input
            type="text"
            value={formData._isPersisting ? "Gerando..." : formData.codempresa || ""}
            readOnly
            placeholder={formData._isPersisting ? "Gerando..." : "AUTO"}
          />
        ) : (
          <Input
            value={formData._isPersisting ? "Gerando..." : formData.codempresa || ""}
            readOnly
            className={inputClass}
            placeholder={formData._isPersisting ? "Gerando..." : "AUTO"}
          />
        ),
    },
    {
      id: "razao_social",
      name: "razao_social",
      label: "Nome/Razão Social Emp.",
      type: "text",
      required: true,
      errorKey: "razao_social",
      wide: true,
      uppercase: true,
      placeholder: "NOME/RAZÃO SOCIAL",
    },
    {
      id: "status",
      name: "status",
      label: "Ativa",
      type: "select",
      widthType: "SIM_NAO",
      compact: true,
      render: renderStatusSelect,
    },
    {
      id: "nome_fantasia",
      name: "nome_fantasia",
      label: "Nome fantasia",
      type: "text",
      medium: true,
      uppercase: true,
      placeholder: "NOME FANTASIA",
    },
    {
      id: "cpf_cnpj",
      name: "cpf_cnpj",
      label: formData.tipo_pessoa === "PF" ? "CPF" : "CNPJ",
      type: "cpf_cnpj",
      compact: true,
      placeholder: formData.tipo_pessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00",
    },
    {
      id: "inscricao_estadual",
      name: "inscricao_estadual",
      label: "Inscrição Estadual",
      type: "text",
      placeholder: "INSCRIÇÃO ESTADUAL",
    },
    { id: "telefone", name: "telefone", label: "Telefone", type: "tel", compact: true, placeholder: "(00) 0000-0000" },
    { id: "whatsapp", name: "whatsapp", label: "WhatsApp", type: "tel", compact: true, placeholder: "(00) 00000-0000" },
    { id: "email", name: "email", label: "E-mail", type: "email", placeholder: "EMAIL@EMPRESA.COM.BR" },
    {
      id: "logo_url",
      name: "logo_url",
      label: "Logo da Empresa",
      type: "image",
      compact: true,
      render: () => (
        <EmpFormImageField
          value={formData.logo_url}
          readOnly={isReadOnly}
          uploading={uploadingLogo}
          onUpload={handleLogoUpload}
          onClear={() => handleChange("logo_url", "")}
          alt="Logo da empresa"
        />
      ),
    },
    { id: "cep", name: "cep", label: "CEP", type: "cep", compact: true, placeholder: "00000-000" },
    { id: "endereco", name: "endereco", label: "Endereço", type: "text", medium: true, uppercase: true, placeholder: "RUA, AVENIDA..." },
    { id: "numero", name: "numero", label: "Número", type: "text", widthType: "NUMERO", compact: true, placeholder: "Nº" },
    { id: "bairro", name: "bairro", label: "Bairro", type: "text", uppercase: true, placeholder: "BAIRRO" },
    { id: "cidade", name: "cidade", label: "Cidade", type: "text", uppercase: true, placeholder: "CIDADE" },
    {
      id: "estado",
      name: "estado",
      label: "Estado (UF)",
      type: "autocomplete",
      widthType: "UF",
      compact: true,
      options: opcoesEstado,
      placeholder: "UF",
      displayField: "nome",
      searchFields: ["nome"],
    },
    {
      id: "observacoes",
      name: "observacoes",
      label: "Observações",
      type: "textarea",
      wide: true,
      uppercase: true,
      placeholder: "OBSERVAÇÕES GERAIS...",
    },
    ...camposPersonalizadosForm.map((campo) => ({
      id: `custom:${campo.field_name}`,
      name: campo.field_name,
      label: campo.label,
      type: campo.tipo,
      origem: "customizado",
      dataField: `campos_personalizados.${campo.field_name}`,
      getValue: (values) => values.campos_personalizados?.[campo.field_name] ?? "",
      optionsMode:
        ["select", "option_list"].includes(campo.tipo) &&
        !(campo.options_source_entity || campo.relation_entity)
          ? "manual"
          : "",
      required: campo.obrigatorio,
      errorKey: `campos_personalizados.${campo.field_name}`,
      wide: campo.tipo === "textarea",
      medium: ["datetime", "datetime-local", "data_hora", "datahora"].includes(campo.tipo),
      compact:
        (["number", "date", "data", "time", "calculado"].includes(campo.tipo) && !campo.usar_mascara) ||
        ["imagem", "image", "file"].includes(campo.tipo),
      totalizable: ["number", "calculado"].includes(campo.tipo) && !campo.usar_mascara,
      options: ["select", "option_list"].includes(campo.tipo)
        ? campoEngine.getOptionsCampo(campo, relatedOptions).map((option) => ({
            id: String(option.value || option.label || ""),
            nome: String(option.label || option.value || "").toUpperCase(),
          }))
        : [],
      displayField: "nome",
      searchFields: ["nome"],
      render: (fieldCtx) => renderCampoPersonalizado(campo, fieldCtx),
    })),
  ];
}

export default buildEmpresasDynamicFields;
