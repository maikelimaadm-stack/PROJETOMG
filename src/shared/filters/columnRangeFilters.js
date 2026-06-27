/** Helpers genéricos de filtros por intervalo/lista — promovidos de tblEmp.filters (V15). */
import { getColumnFilterType, parseDateFilterValue, parseNumberFilterValue } from "@/shared/filters";

export const getRangeFilterValues = (valores, ft) => {
  if (ft === "number" || ft === "money") {
    return valores.filter((i) => String(i).startsWith("min:") || String(i).startsWith("max:"));
  }
  if (ft === "date") {
    return valores.filter((i) => String(i).startsWith("start:") || String(i).startsWith("end:"));
  }
  return [];
};

export const getListFilterValues = (valores, ft) => {
  if (ft === "number" || ft === "money") {
    return valores.filter((i) => !String(i).startsWith("min:") && !String(i).startsWith("max:"));
  }
  if (ft === "date") {
    return valores.filter((i) => !String(i).startsWith("start:") && !String(i).startsWith("end:"));
  }
  return valores;
};

export const formatRangeTokenForInput = (token, ft, col) => {
  if (!token) return "";
  const raw = String(token).replace(/^(min:|max:|start:|end:)/, "");
  if (!raw) return "";
  if (ft === "date") {
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      const [ano, mes, dia] = raw.split("T")[0].split("-");
      return `${dia}/${mes}/${ano}`;
    }
    return raw;
  }
  const n = parseNumberFilterValue(raw);
  if (!Number.isFinite(n)) return raw;
  if (col?.id === "codempresa") return String(n);
  const places = col?.decimal_places ?? 2;
  return n.toLocaleString(
    "pt-BR",
    col?.usar_decimal
      ? { minimumFractionDigits: places, maximumFractionDigits: places }
      : { maximumFractionDigits: 0 }
  );
};

export const getRangeTokenInputValue = (token) => {
  if (!token) return "";
  return String(token).replace(/^(min:|max:|start:|end:)/, "");
};

export const normalizeRangeValoresForEdit = (colunaId, valores, colunasDisponiveis) => {
  const col = colunasDisponiveis.find((c) => c.id === colunaId);
  const ft = getColumnFilterType(col);
  if (ft !== "number" && ft !== "date" && ft !== "money") return valores;
  return valores.map((v) => {
    const s = String(v);
    if (s.startsWith("min:") || s.startsWith("max:") || s.startsWith("start:") || s.startsWith("end:")) {
      const prefix = s.match(/^(min:|max:|start:|end:)/)?.[0] || "";
      const formatted = formatRangeTokenForInput(s, ft, col);
      return formatted ? `${prefix}${formatted}` : v;
    }
    return v;
  });
};

export const optionPassaRangeTemp = (opt, ft, tempValores) => {
  if (!tempValores?.length) return true;
  const minTok = tempValores.find((i) => String(i).startsWith(ft === "date" ? "start:" : "min:"));
  const maxTok = tempValores.find((i) => String(i).startsWith(ft === "date" ? "end:" : "max:"));
  if (!minTok && !maxTok) return true;
  if (ft === "number" || ft === "money") {
    const nv = parseNumberFilterValue(String(opt));
    const minN = minTok ? parseNumberFilterValue(String(minTok).replace("min:", "")) : NaN;
    const maxN = maxTok ? parseNumberFilterValue(String(maxTok).replace("max:", "")) : NaN;
    if (Number.isFinite(minN) && nv < minN) return false;
    if (Number.isFinite(maxN) && nv > maxN) return false;
    return true;
  }
  const ts = parseDateFilterValue(opt);
  const startTs = minTok ? parseDateFilterValue(String(minTok).replace("start:", "")) : null;
  const endTs = maxTok ? parseDateFilterValue(String(maxTok).replace("end:", "")) : null;
  if (startTs != null && ts != null && ts < startTs) return false;
  if (endTs != null && ts != null && ts > endTs) return false;
  return true;
};
