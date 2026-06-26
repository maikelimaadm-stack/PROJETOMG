/**
 * Camada de layout MAK — chrome MG extraído de Empresas (Tela Mãe).
 */
export { default as MakDesktopHeader } from "./MgDesktopHeader";
export { default as MakMobileHeader } from "./MgMobileHeader";
export { default as MakMobileOverlays } from "./MgEmpresasMobileOverlays";
export { default as MakShell } from "./MgEmpresasShell";
export {
  MgEmpresasChromeProvider as MakChromeProvider,
  useMgEmpresasChrome as useMakChrome,
} from "./MgEmpresasChromeContext";
export { default as MakActionBar } from "./MgActionBar";
export { default as MakFilterPanel } from "./MgFilterPanel";
export { default as MakContextPanel } from "./MgContextPanel";
export { default as MakCardsPanelStrip } from "./MgCardsPanelStrip";
export { default as MakTablePanelStrip } from "./MgTablePanelStrip";
export { default as MakMobileViewBar } from "./MgMobileViewBar";
export { default as MakPortalPanel } from "./MgPortalPanel";
export { default as MakConfigBackdrop } from "./MgConfigBackdrop";
export { default as MakCmdSelect } from "./MgCmdSelect";
export { default as MakMotionPanel } from "./MgMotionPanel";
export { default as MakRecordFavoriteStar } from "./MgRecordFavoriteStar";
export { default as MakLookup } from "./MgLookup";
export { default as MakDatePicker } from "./MgDatePicker";
export { default as MakTimePicker } from "./MgTimePicker";
export { default as MakFilterPills } from "./MgFilterPills";
export { default as MakSearchResultsDropdown } from "./MgSearchResultsDropdown";
export { default as MakViewSeg } from "./MgViewSeg";
export { default as MakSpeedDialMenu } from "./MgSpeedDialMenu";
export { default as MakMobileFilterStrip } from "./MgMobileFilterStrip";
export { default as MakMobileMenu } from "./MgMobileMenu";
export { default as MakPreferenceConfigFooter } from "./MgPreferenceConfigFooter";
export { default as MakPrototypeSidebar } from "./MgPrototypeSidebar";
export { default as MakEmpresasLayoutRoute } from "./MgEmpresasLayoutRoute";

export { isMakCadastroRoute, MAK_CADASTRO_ROUTES } from "@/framework/mak/routes/makCadastroRoutes.js";
export { applyMgViewMode, resolveMgViewMode, normalizeEmpListViewMode } from "./mgViewMode.js";
export { resolveMgActionBarVisibility } from "./mgActionBarRules.js";
export { buildMgFilterFields, buildPanelFilterColumnMap } from "./mgFilterFields.js";
export { isNestedMgFloatingPanelTarget } from "./mgFloatingPanelUtils.js";
export { useMgPanelPosition, closeMgPanels, useMgPanelCoordinator } from "./useMgPanelPosition.js";
export { default as useMgSegSlider } from "./useMgSegSlider.js";

/** @deprecated use MakActionBar */
export { default as MgActionBar } from "./MgActionBar";
