import { exportRowsToXlsx } from "@/framework/cadastro/exports/xlsxExportUtils";

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const buildTableHtml = ({ columns = [], rows = [], totalRows = [], title = "Cadastro" }) => {
  const totalWidth = columns.reduce((sum, col) => sum + Number(col.width || 120), 0);
  const pageWidthMm = 281;
  const pxToMmRatio = pageWidthMm / Math.max(totalWidth, 1);

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 landscape; margin: 8mm; }
    body { font-family: Calibri, Arial, sans-serif; color: #111827; margin: 0; }
    h1 { font-size: 14px; margin: 0 0 8px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: 1px solid #d1d5db; padding: 3px 4px; font-size: 10px; white-space: normal; overflow-wrap: anywhere; word-break: break-word; vertical-align: top; }
    th { background: #f3f4f6; font-weight: 700; }
    .total-row td { background: #e5e7eb; font-weight: 700; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <table>
    <colgroup>${columns.map((col) => `<col style="width:${Math.max(8, Number(col.width || 120) * pxToMmRatio).toFixed(2)}mm" />`).join("")}</colgroup>
    <thead><tr>${columns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}${totalRows.map((row) => `<tr class="total-row">${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>
</body>
</html>`;
};

const toExportFileName = (title = "cadastro") =>
  String(title || "cadastro")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "cadastro";

export function printCadastroTable(data) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(buildTableHtml(data));
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function exportCadastroTableToExcel({
  columns = [],
  rows = [],
  totalRows = [],
  title = "Cadastro",
  fileName,
}) {
  exportRowsToXlsx({
    columns,
    rows,
    totalRows,
    title,
    fileName: fileName || toExportFileName(title),
  });
}

// Compatibilidade retroativa com implementacao Empresas.
export const printEmpTable = printCadastroTable;
export const exportEmpTableToExcel = exportCadastroTableToExcel;