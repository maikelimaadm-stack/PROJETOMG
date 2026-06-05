import { Copy, Eye, Loader2, Pencil, Plus, Settings } from "lucide-react";

const titleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

export const getOperationBadge = (operationLabel) => {
  const normalized = String(operationLabel || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  if (normalized.includes("SALVAND")) return { Icon: Loader2, label: "Salvando" };
  if (normalized.includes("EDITAND")) return { Icon: Pencil, label: "Editando" };
  if (normalized.includes("VISUALIZAND")) return { Icon: Eye, label: "Visualizando registro" };
  if (normalized.includes("VISUALIZ") || normalized.includes("VISUALIZACAO")) {
    return { Icon: Eye, label: "Visualizando registro" };
  }
  if (normalized.includes("DUPLICAD")) return { Icon: Copy, label: "Novo registro duplicado" };
  if (normalized.includes("NOVO REGISTRO")) return { Icon: Plus, label: "Novo registro" };
  if (normalized.includes("EDICAO")) return { Icon: Pencil, label: "Editando" };
  if (normalized.includes("NOVO")) return { Icon: Plus, label: "Novo registro" };
  if (normalized.includes("CONFIGUR")) return { Icon: Settings, label: "Configuração" };

  return { Icon: Eye, label: titleCase(operationLabel || "Visualizando registro") };
};
