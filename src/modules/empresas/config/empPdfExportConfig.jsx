import { createModuleExportConfigStore } from "@/framework/cadastro/config/moduleExportConfig";

const exportConfigStore = createModuleExportConfigStore("empresas");

export function getEmpPdfExportConfig() {
  return exportConfigStore.getPdfConfig();
}

export function saveEmpPdfExportConfig(config) {
  exportConfigStore.savePdfConfig(config);
}

export function getEmpExcelExportConfig() {
  return exportConfigStore.getExcelConfig();
}

export function saveEmpExcelExportConfig(config) {
  exportConfigStore.saveExcelConfig(config);
}