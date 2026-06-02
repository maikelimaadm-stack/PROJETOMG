import { createModuleExportConfigStore } from "@/framework/cadastro/config/moduleExportConfig";

const exportConfigStore = createModuleExportConfigStore("fazendas");

export const getFazendasPdfExportConfig = () => exportConfigStore.getPdfConfig();
export const saveFazendasPdfExportConfig = (config) => exportConfigStore.savePdfConfig(config);

export const getFazendasExcelExportConfig = () => exportConfigStore.getExcelConfig();
export const saveFazendasExcelExportConfig = (config) => exportConfigStore.saveExcelConfig(config);

