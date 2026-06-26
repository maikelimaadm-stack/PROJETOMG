/**
 * Camada de layout MAK — chrome MG extraído de Empresas (Tela Mãe).
 * ErpShell e demais consumidores importam daqui, não de modules/empresas.
 */
export { default as MakDesktopHeader } from "./MgDesktopHeader";
export { default as MakMobileHeader } from "./MgMobileHeader";
export { default as MakMobileOverlays } from "./MgEmpresasMobileOverlays";
export {
  MgEmpresasChromeProvider as MakChromeProvider,
  useMgEmpresasChrome as useMakChrome,
} from "./MgEmpresasChromeContext";

export const isMakCadastroRoute = (pathname) =>
  pathname === "/" ||
  pathname === "/CadastroEmpresas" ||
  pathname.startsWith("/CadastroEmpresas/");
