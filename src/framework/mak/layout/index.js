/**
 * Camada de layout MAK — fachada sobre chrome MG (Empresas como Tela Mãe).
 * ErpShell e demais consumidores importam daqui, não de modules/empresas.
 */
export { default as MakDesktopHeader } from "@/modules/empresas/layout/MgDesktopHeader";
export { default as MakMobileHeader } from "@/modules/empresas/layout/MgMobileHeader";
export { default as MakMobileOverlays } from "@/modules/empresas/layout/MgEmpresasMobileOverlays";
export {
  MgEmpresasChromeProvider as MakChromeProvider,
  useMgEmpresasChrome as useMakChrome,
} from "@/modules/empresas/layout/MgEmpresasChromeContext";

export const isMakCadastroRoute = (pathname) =>
  pathname === "/" ||
  pathname === "/CadastroEmpresas" ||
  pathname.startsWith("/CadastroEmpresas/");
