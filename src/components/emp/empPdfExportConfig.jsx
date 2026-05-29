const PDF_KEY = "emp_pdf_export_config";
const EXCEL_KEY = "emp_excel_export_config";
const DEFAULT = { useConfiguredColumns: false, columnIds: [] };

function readCfg(key) {
  try {
    const p = JSON.parse(localStorage.getItem(key) || "{}");
    return { useConfiguredColumns: Boolean(p.useConfiguredColumns), columnIds: Array.isArray(p.columnIds) ? p.columnIds : [] };
  } catch { return DEFAULT; }
}

export const getEmpPdfExportConfig = () => readCfg(PDF_KEY);
export const getEmpExcelExportConfig = () => readCfg(EXCEL_KEY);
export const saveEmpPdfExportConfig = cfg => localStorage.setItem(PDF_KEY, JSON.stringify(cfg));
export const saveEmpExcelExportConfig = cfg => localStorage.setItem(EXCEL_KEY, JSON.stringify(cfg));