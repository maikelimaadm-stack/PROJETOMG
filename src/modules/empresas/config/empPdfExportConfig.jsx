export const EMP_PDF_EXPORT_CONFIG_KEY = "cadastro_emp_pdf_export_config";
export const EMP_EXCEL_EXPORT_CONFIG_KEY = "cadastro_emp_excel_export_config";

const DEFAULT_EXPORT_CONFIG = { useConfiguredColumns: false, columnIds: [] };

function readExportConfig(key) {
  const saved = localStorage.getItem(key);
  if (!saved) return DEFAULT_EXPORT_CONFIG;
  try {
    const parsed = JSON.parse(saved);
    return {
      useConfiguredColumns: Boolean(parsed.useConfiguredColumns),
      columnIds: Array.isArray(parsed.columnIds) ? parsed.columnIds : []
    };
  } catch {
    return DEFAULT_EXPORT_CONFIG;
  }
}

function saveExportConfig(key, config) {
  localStorage.setItem(key, JSON.stringify({
    useConfiguredColumns: Boolean(config.useConfiguredColumns),
    columnIds: Array.isArray(config.columnIds) ? config.columnIds : []
  }));
}

export function getEmpPdfExportConfig() {
  return readExportConfig(EMP_PDF_EXPORT_CONFIG_KEY);
}

export function saveEmpPdfExportConfig(config) {
  saveExportConfig(EMP_PDF_EXPORT_CONFIG_KEY, config);
}

export function getEmpExcelExportConfig() {
  return readExportConfig(EMP_EXCEL_EXPORT_CONFIG_KEY);
}

export function saveEmpExcelExportConfig(config) {
  saveExportConfig(EMP_EXCEL_EXPORT_CONFIG_KEY, config);
}