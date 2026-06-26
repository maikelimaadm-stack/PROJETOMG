export * from "./preferences/index.js";
export * from "./layout/index.js";
export * from "./ux/index.js";
export * from "./module/index.js";
export * from "./events/index.js";
export * from "./permissions/index.js";
export * from "./filters/index.js";
export { default as MakTable } from "./table/MakTable.jsx";
export { default as MakFormShell } from "./form/MakFormShell.jsx";
export { default as MakToolbar } from "./toolbar/MakToolbar.jsx";
export { default as MakDock } from "./dock/MakDock.jsx";
export {
  MakFormPanel,
  MakTablePanel,
  MakSearchPanel,
  EmpresasFormPanel,
  EmpresasTablePanel,
  EmpresasSearchPanel,
} from "./page/MakCadastroPage.jsx";
export { isMakCadastroRoute, MAK_CADASTRO_ROUTES } from "./routes/makCadastroRoutes.js";
export { ensureMakPrototypeStyles } from "./styles/ensureMakPrototypeStyles.js";
