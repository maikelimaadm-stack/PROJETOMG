import { formatIdGlobal } from "@/shared/utils/formatIdGlobal";

export function resolveEmpresasFieldValue(record, colId) {
  if (!record) return "-";

  switch (colId) {
    case "id_global":
      return record.id_global ? formatIdGlobal(record.id_global) : "-";
    case "codempresa":
      return record.codempresa ?? "-";
    case "razao_social":
      return record.razao_social || "-";
    case "nome_fantasia":
      return record.nome_fantasia || "-";
    case "tipo_pessoa":
      return record.tipo_pessoa || "-";
    case "tipo_vinculo":
      if (record.tipo_vinculo === "proprietario") return "PROPRIETÁRIO";
      if (record.tipo_vinculo === "arrendatario") return "ARRENDATÁRIO";
      return "-";
    case "cpf_cnpj":
      return record.cpf_cnpj || "-";
    case "inscricao_estadual":
      return record.inscricao_estadual || "-";
    case "telefone":
      return record.telefone || "-";
    case "whatsapp":
      return record.whatsapp || "-";
    case "email":
      return record.email || "-";
    case "logo_url":
      return record.logo_url || "-";
    case "cep":
      return record.cep || "-";
    case "endereco":
      return record.endereco || "-";
    case "numero":
      return record.numero || "-";
    case "bairro":
      return record.bairro || "-";
    case "cidade":
      return record.cidade || "-";
    case "estado":
      return record.estado || "-";
    case "observacoes":
      return record.observacoes || "-";
    case "status":
      return record.status || "-";
    default:
      if (record[colId] != null && record[colId] !== "") return record[colId];
      return undefined;
  }
}

export function resolveEmpresasComparableValue(record, col) {
  if (col?.id === "id_global") return Number(record?.id_global || 0);
  if (col?.id === "codempresa") return Number(record?.codempresa || 0);
  return resolveEmpresasFieldValue(record, col?.id);
}
