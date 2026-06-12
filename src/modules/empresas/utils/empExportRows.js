import campoEngine from "@/framework/cadastro/fields/campoEngine";
import { formatIdGlobal } from "@/shared/utils/formatIdGlobal";

export function getEmpresaExportCellValue(emp, colId) {
  if (colId === "id_global") return emp.id_global ? formatIdGlobal(emp.id_global) : "-";
  if (colId === "codempresa") return emp.codempresa ?? "-";
  if (colId === "tipo_vinculo") {
    if (emp.tipo_vinculo === "proprietario") return "PROPRIETÁRIO";
    if (emp.tipo_vinculo === "arrendatario") return "ARRENDATÁRIO";
    return "-";
  }
  if (Object.prototype.hasOwnProperty.call(emp, colId)) {
    const value = emp[colId];
    return value == null || value === "" ? "-" : value;
  }
  return campoEngine.getValorCampo(emp, { id: colId }, {}) ?? "-";
}

export function buildEmpresaExportRows(items = [], columns = []) {
  return items.map((emp) => columns.map((col) => getEmpresaExportCellValue(emp, col.id)));
}
