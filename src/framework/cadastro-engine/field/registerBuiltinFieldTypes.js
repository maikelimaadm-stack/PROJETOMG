import { registerFieldType } from "./FieldRegistry.js";

const standard = { layoutBehavior: "standard" };
const inlineMedia = { layoutBehavior: "inline-media" };

export function registerBuiltinFieldTypes() {
  registerFieldType("text", { id: "text", renderer: "text", ...standard, aliases: ["texto", "string"] });
  registerFieldType("number", { id: "number", renderer: "number", ...standard, aliases: ["inteiro", "integer"] });
  registerFieldType("decimal", { id: "decimal", renderer: "decimal", ...standard });
  registerFieldType("moeda", { id: "moeda", renderer: "currency", ...standard });
  registerFieldType("percentual", { id: "percentual", renderer: "percent", ...standard });
  registerFieldType("date", { id: "date", renderer: "date", ...standard, aliases: ["data"] });
  registerFieldType("time", { id: "time", renderer: "time", ...standard, aliases: ["hora"] });
  registerFieldType("datetime", {
    id: "datetime",
    renderer: "datetime",
    ...standard,
    aliases: ["datetime-local", "data_hora", "datahora"],
  });
  registerFieldType("email", { id: "email", renderer: "email", ...standard });
  registerFieldType("url", { id: "url", renderer: "url", ...standard });
  registerFieldType("tel", {
    id: "tel",
    renderer: "phone",
    ...standard,
    aliases: ["phone", "telefone", "whatsapp", "mobile", "celular"],
  });
  registerFieldType("cep", { id: "cep", renderer: "cep", ...standard });
  registerFieldType("cpf_cnpj", { id: "cpf_cnpj", renderer: "cpf_cnpj", ...standard, aliases: ["cpf", "cnpj"] });
  registerFieldType("autocomplete", {
    id: "autocomplete",
    renderer: "lookup",
    ...standard,
    aliases: ["relation", "relacao", "lookup"],
  });
  registerFieldType("select", { id: "select", renderer: "select", ...standard, aliases: ["lista"] });
  registerFieldType("option_list", {
    id: "option_list",
    renderer: "multiselect",
    ...standard,
    aliases: ["multiselect", "multi_select", "lista_multipla"],
  });
  registerFieldType("checkbox", { id: "checkbox", renderer: "checkbox", ...standard, aliases: ["sim_nao", "switch"] });
  registerFieldType("switch", { id: "switch", renderer: "switch", ...standard });
  registerFieldType("textarea", {
    id: "textarea",
    renderer: "textarea",
    ...standard,
    aliases: ["observacao", "multiline", "html", "richtext", "rich_text", "memo", "markdown"],
  });
  registerFieldType("image", { id: "image", renderer: "image", ...inlineMedia, aliases: ["imagem"] });
  registerFieldType("file", {
    id: "file",
    renderer: "file",
    ...inlineMedia,
    aliases: ["arquivo", "attachment", "attachments", "document", "documents", "assinatura"],
  });
  registerFieldType("calculado", { id: "calculado", renderer: "formula", ...standard, aliases: ["formula"] });
  registerFieldType("galeria", { id: "galeria", renderer: "gallery", ...standard });
  registerFieldType("documentos", { id: "documentos", renderer: "documents", ...standard });
}

let registered = false;
export function ensureBuiltinFieldTypes() {
  if (registered) return;
  registerBuiltinFieldTypes();
  registered = true;
}
