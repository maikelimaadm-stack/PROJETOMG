import { registerFieldType } from "./FieldRegistry.js";

const compact = { layoutBehavior: "compact" };
const expansive = { layoutBehavior: "expansive" };
const inlineMedia = { layoutBehavior: "inline-media" };

export function registerBuiltinFieldTypes() {
  registerFieldType("text", { id: "text", renderer: "text", ...compact, aliases: ["texto", "string"] });
  registerFieldType("number", { id: "number", renderer: "number", ...compact, aliases: ["inteiro", "integer"] });
  registerFieldType("decimal", { id: "decimal", renderer: "decimal", ...compact });
  registerFieldType("moeda", { id: "moeda", renderer: "currency", ...compact });
  registerFieldType("percentual", { id: "percentual", renderer: "percent", ...compact });
  registerFieldType("date", { id: "date", renderer: "date", ...compact, aliases: ["data"] });
  registerFieldType("time", { id: "time", renderer: "time", ...compact, aliases: ["hora"] });
  registerFieldType("datetime", {
    id: "datetime",
    renderer: "datetime",
    ...compact,
    aliases: ["datetime-local", "data_hora", "datahora"],
  });
  registerFieldType("email", { id: "email", renderer: "email", ...compact });
  registerFieldType("url", { id: "url", renderer: "url", ...compact });
  registerFieldType("tel", {
    id: "tel",
    renderer: "phone",
    ...compact,
    aliases: ["phone", "telefone", "whatsapp", "mobile", "celular"],
  });
  registerFieldType("cep", { id: "cep", renderer: "cep", ...compact });
  registerFieldType("cpf_cnpj", { id: "cpf_cnpj", renderer: "cpf_cnpj", ...compact, aliases: ["cpf", "cnpj"] });
  registerFieldType("autocomplete", { id: "autocomplete", renderer: "lookup", ...compact, aliases: ["relation", "relacao", "lookup"] });
  registerFieldType("select", { id: "select", renderer: "select", ...compact, aliases: ["lista"] });
  registerFieldType("option_list", {
    id: "option_list",
    renderer: "multiselect",
    ...compact,
    aliases: ["multiselect", "multi_select", "lista_multipla"],
  });
  registerFieldType("checkbox", { id: "checkbox", renderer: "checkbox", ...compact, aliases: ["sim_nao", "switch"] });
  registerFieldType("switch", { id: "switch", renderer: "switch", ...compact });
  registerFieldType("textarea", {
    id: "textarea",
    renderer: "textarea",
    ...expansive,
    aliases: ["observacao", "multiline", "html", "richtext", "rich_text", "memo", "markdown"],
  });
  registerFieldType("image", { id: "image", renderer: "image", ...inlineMedia, aliases: ["imagem"] });
  registerFieldType("file", {
    id: "file",
    renderer: "file",
    ...inlineMedia,
    aliases: ["arquivo", "attachment", "attachments", "document", "documents", "assinatura"],
  });
  registerFieldType("calculado", { id: "calculado", renderer: "formula", ...compact, aliases: ["formula"] });
  registerFieldType("galeria", { id: "galeria", renderer: "gallery", ...expansive });
  registerFieldType("documentos", { id: "documentos", renderer: "documents", ...expansive });
}

let registered = false;
export function ensureBuiltinFieldTypes() {
  if (registered) return;
  registerBuiltinFieldTypes();
  registered = true;
}
