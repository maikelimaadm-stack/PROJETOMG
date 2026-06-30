import generatedModules from "@/modules/generatedModules.json";

const MODELO_BASE_MENU_MODULE_IDS = new Set(["empresas", "cadcps"]);

const CADASTRO_MENU_ITEM_OVERRIDES = {
  empresas: { id: "empresas", label: "Empresas" },
  cadcps: { id: "campos_personalizados", label: "Campos Personalizados" },
};

const moduleById = Object.fromEntries(generatedModules.map((module) => [module.moduleId, module]));

const getMenuItemBaseId = (moduleId) => CADASTRO_MENU_ITEM_OVERRIDES[moduleId]?.id ?? moduleId;

const getMenuItemId = (moduleId, isModeloBaseGroup) =>
  isModeloBaseGroup ? `mb1-${getMenuItemBaseId(moduleId)}` : getMenuItemBaseId(moduleId);

const buildMenuItem = (module, isModeloBaseGroup) => {
  const override = CADASTRO_MENU_ITEM_OVERRIDES[module.moduleId];
  return {
    id: getMenuItemId(module.moduleId, isModeloBaseGroup),
    label: override?.label ?? module.menuLabel ?? module.moduleId,
    routePath: module.routePath,
    moduleId: module.moduleId,
  };
};

const buildCadastroMenuItems = () => generatedModules.map((module) => buildMenuItem(module, false));

const buildModeloBaseMenuItems = () =>
  generatedModules
    .filter((module) => MODELO_BASE_MENU_MODULE_IDS.has(module.moduleId))
    .map((module) => buildMenuItem(module, true));

/** Apenas módulos já implementados no sistema. */
export const ERP_MENU_SECTIONS = [
  {
    id: "cadastros",
    type: "group",
    label: "Cadastro",
    icon: "folder-open",
    defaultOpen: true,
    items: buildCadastroMenuItems(),
  },
  {
    id: "modelo-base1",
    type: "group",
    label: "Modelo Base1",
    icon: "folder-open",
    defaultOpen: true,
    items: buildModeloBaseMenuItems(),
  },
];

const routeMetaByPath = {
  "/CadastroEmpresas": { sectionId: "cadastros", itemId: "empresas", breadcrumb: "Empresas" },
  "/CadastroCamposPersonalizados": {
    sectionId: "cadastros",
    itemId: "campos_personalizados",
    breadcrumb: "Campos Personalizados",
  },
};

generatedModules.forEach((module) => {
  if (routeMetaByPath[module.routePath]) return;
  routeMetaByPath[module.routePath] = {
    sectionId: "cadastros",
    itemId: getMenuItemId(module.moduleId, false),
    breadcrumb: module.menuLabel,
  };
});

const resolveModuleFromItemId = (itemId) => {
  if (!itemId) return null;
  const normalized = String(itemId).replace(/^mb1-/, "");
  const direct = moduleById[normalized];
  if (direct) return direct;
  const byOverride = Object.entries(CADASTRO_MENU_ITEM_OVERRIDES).find(
    ([, value]) => value.id === normalized
  );
  return byOverride ? moduleById[byOverride[0]] ?? null : null;
};

export const resolveErpRouteMeta = (pathname) => {
  return routeMetaByPath[pathname] || null;
};

export const buildErpBreadcrumbs = (pathname) => {
  const meta = resolveErpRouteMeta(pathname);
  if (!meta) return [{ label: "Início" }];

  const section = ERP_MENU_SECTIONS.find((entry) => entry.id === meta.sectionId);
  const crumbs = [];

  if (section?.label) {
    crumbs.push({ label: section.label });
  }

  const item = section?.items?.find((entry) => entry.id === meta.itemId) || resolveModuleFromItemId(meta.itemId);

  crumbs.push({
    label: meta.breadcrumb || item?.label || item?.menuLabel || "Página",
  });

  return crumbs;
};

export const isRouteActive = (pathname, routePath) => {
  if (!routePath) return false;
  return pathname === routePath;
};

export const shouldMenuGroupBeOpen = (pathname, section) => {
  if (!section || section.type !== "group") return false;
  if (section.defaultOpen) return true;
  return section.items?.some((item) => isRouteActive(pathname, item.routePath));
};
