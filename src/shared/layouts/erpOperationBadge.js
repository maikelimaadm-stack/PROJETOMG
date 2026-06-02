import { Copy, Eye, Pencil, Plus } from "lucide-react";

const titleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

export const getOperationBadge = (operationLabel) => {
  const normalized = String(operationLabel || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  if (normalized.includes("VISUALIZ")) return { Icon: Eye, label: "Visualização" };
  if (normalized.includes("EDICAO")) return { Icon: Pencil, label: "Edição" };
  if (normalized.includes("DUPLICAD")) return { Icon: Copy, label: "Duplicado" };
  if (normalized.includes("NOVO")) return { Icon: Plus, label: "Novo" };
  if (normalized.includes("CONFIGUR")) return { Icon: Pencil, label: "Configuração" };

  return { Icon: Eye, label: titleCase(operationLabel || "Visualização") };
};
