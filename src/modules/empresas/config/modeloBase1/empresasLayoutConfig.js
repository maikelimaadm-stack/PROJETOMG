/**
 * Empresas — layout, view mode, scope CSS, cards visibility.
 */
export { useEmpViewModePreference } from "@/modules/empresas/hooks/useEmpViewModePreference";
export { useEmpCardsVisFields } from "@/modules/empresas/hooks/useEmpCardsVisFields";
export { getFieldsPerRowForLayout } from "@/modules/empresas/components/empSearchView.constants";

export const empresasLayoutConfig = {
  scopeCssClass: "cadastro-emp-scope mg-empresas-scope",
  listMode: "infinite",
};
