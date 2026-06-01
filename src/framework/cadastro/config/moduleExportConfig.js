const DEFAULT_EXPORT_CONFIG = { useConfiguredColumns: false, columnIds: [] };

const buildExportConfigKey = (moduleId, format) =>
  `cadastro_${moduleId}_${format}_export_config`;

const readExportConfig = (key) => {
  const saved = localStorage.getItem(key);
  if (!saved) return DEFAULT_EXPORT_CONFIG;
  try {
    const parsed = JSON.parse(saved);
    return {
      useConfiguredColumns: Boolean(parsed.useConfiguredColumns),
      columnIds: Array.isArray(parsed.columnIds) ? parsed.columnIds : [],
    };
  } catch {
    return DEFAULT_EXPORT_CONFIG;
  }
};

const saveExportConfig = (key, config) => {
  localStorage.setItem(
    key,
    JSON.stringify({
      useConfiguredColumns: Boolean(config.useConfiguredColumns),
      columnIds: Array.isArray(config.columnIds) ? config.columnIds : [],
    })
  );
};

export const createModuleExportConfigStore = (moduleId) => {
  const pdfKey = buildExportConfigKey(moduleId, "pdf");
  const excelKey = buildExportConfigKey(moduleId, "excel");

  return {
    getPdfConfig() {
      return readExportConfig(pdfKey);
    },
    savePdfConfig(config) {
      saveExportConfig(pdfKey, config);
    },
    getExcelConfig() {
      return readExportConfig(excelKey);
    },
    saveExcelConfig(config) {
      saveExportConfig(excelKey, config);
    },
  };
};

