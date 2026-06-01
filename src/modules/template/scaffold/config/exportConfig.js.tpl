import { createModuleExportConfigStore } from "@/framework/cadastro/config/moduleExportConfig";

const exportConfigStore = createModuleExportConfigStore("__MODULE_ID__");

export const get__MODULE_ID_PASCAL__PdfExportConfig = () => exportConfigStore.getPdfConfig();
export const save__MODULE_ID_PASCAL__PdfExportConfig = (config) => exportConfigStore.savePdfConfig(config);

export const get__MODULE_ID_PASCAL__ExcelExportConfig = () => exportConfigStore.getExcelConfig();
export const save__MODULE_ID_PASCAL__ExcelExportConfig = (config) => exportConfigStore.saveExcelConfig(config);

