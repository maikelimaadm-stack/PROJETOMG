import { exportRowsToXlsx } from "@/components/common/xlsxExportUtils";

const esc = v => String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function printEmpTable({ columns = [], rows = [], totalRows = [], title = "Cadastro de Empresas" }) {
  const totalWidth = columns.reduce((s, c) => s + Number(c.width || 120), 0);
  const ratio = 281 / Math.max(totalWidth, 1);
  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${esc(title)}</title><style>@page{size:A4 landscape;margin:8mm}body{font-family:Calibri,Arial,sans-serif;color:#111827;margin:0}h1{font-size:14px;margin:0 0 8px}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #d1d5db;padding:3px 4px;font-size:10px;white-space:normal;overflow-wrap:anywhere;word-break:break-word;vertical-align:top}th{background:#f3f4f6;font-weight:700}.total-row td{background:#e5e7eb;font-weight:700}</style></head><body><h1>${esc(title)}</h1><table><colgroup>${columns.map(c => `<col style="width:${Math.max(8, Number(c.width || 120) * ratio).toFixed(2)}mm"/>`).join("")}</colgroup><thead><tr>${columns.map(c => `<th>${esc(c.label)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}${totalRows.map(r => `<tr class="total-row">${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html); w.document.close(); w.focus(); w.print();
}

export function exportEmpTableToExcel({ columns = [], rows = [], totalRows = [], title = "Cadastro de Empresas" }) {
  exportRowsToXlsx({ columns, rows, totalRows, title, fileName: "cadastro_empresas" });
}