import generatedModules from "@/modules/generatedModules.json";

const moduleById = Object.fromEntries(generatedModules.map((module) => [module.moduleId, module]));

const routeMetaByPath = {
  "/": { sectionId: "cadastros", itemId: "empresas", breadcrumb: "Empresas" },
  "/CadastroEmpresas": { sectionId: "cadastros", itemId: "empresas", breadcrumb: "Empresas" },
  "/CadastroCamposPersonalizados": {
    sectionId: "cadastros",
    itemId: "campos_personalizados",
    breadcrumb: "Campos Personalizados",
  },
};

generatedModules.forEach((module) => {
  if (!routeMetaByPath[module.routePath]) {
    routeMetaByPath[module.routePath] = {
      sectionId: "cadastros",
      itemId: module.moduleId,
      breadcrumb: module.menuLabel,
    };
  }
});

const CADASTRO_MENU_ITEM_OVERRIDES = {
  empresas: { id: "empresas", label: "Empresas" },
  marcas: { id: "marcas", label: "Marcas" },
  cadcps: { id: "campos_personalizados", label: "Campos Personalizados" },
};

const buildCadastroMenuItems = () =>
  generatedModules.map((module) => {
    const override = CADASTRO_MENU_ITEM_OVERRIDES[module.moduleId];
    return {
      id: override?.id ?? module.moduleId,
      label: override?.label ?? module.menuLabel ?? module.moduleId,
      routePath: module.routePath,
      moduleId: module.moduleId,
    };
  });

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
];

export const resolveErpRouteMeta = (pathname) => {
  const normalized = pathname === "/" ? "/CadastroEmpresas" : pathname;
  return routeMetaByPath[normalized] || routeMetaByPath[pathname] || null;
};

export const buildErpBreadcrumbs = (pathname) => {
  const meta = resolveErpRouteMeta(pathname);
  if (!meta) return [{ label: "Início" }];

  const section = ERP_MENU_SECTIONS.find((entry) => entry.id === meta.sectionId);
  const crumbs = [];

  if (section?.label) {
    crumbs.push({ label: section.label });
  }

  const item =
    section?.items?.find((entry) => entry.id === meta.itemId) ||
    generatedModules.find((module) => module.moduleId === meta.itemId);

  crumbs.push({
    label: meta.breadcrumb || item?.label || item?.menuLabel || "Página",
  });

  return crumbs;
};

export const isRouteActive = (pathname, routePath) => {
  if (!routePath) return false;
  if (routePath === "/CadastroEmpresas") {
    return pathname === "/" || pathname === "/CadastroEmpresas";
  }
  return pathname === routePath;
};

export const shouldMenuGroupBeOpen = (pathname, section) => {
  if (!section || section.type !== "group") return false;
  if (section.defaultOpen) return true;
  return section.items?.some((item) => isRouteActive(pathname, item.routePath));
};
