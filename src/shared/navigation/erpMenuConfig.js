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

export const ERP_MENU_SECTIONS = [
  {
    id: "dashboard",
    type: "link",
    label: "Dashboard",
    icon: "layout-dashboard",
    routePath: "/dashboard",
    disabled: true,
  },
  {
    id: "cadastros",
    type: "group",
    label: "Cadastros",
    icon: "folder-open",
    defaultOpen: true,
    items: [
      {
        id: "empresas",
        label: "Empresas",
        routePath: moduleById.empresas?.routePath || "/CadastroEmpresas",
        moduleId: "empresas",
      },
      {
        id: "clientes",
        label: "Clientes",
        routePath: "/cadastros/clientes",
        disabled: true,
      },
      {
        id: "fornecedores",
        label: "Fornecedores",
        routePath: "/cadastros/fornecedores",
        disabled: true,
      },
      {
        id: "produtos",
        label: "Produtos",
        routePath: "/cadastros/produtos",
        disabled: true,
      },
      {
        id: "servicos",
        label: "Serviços",
        routePath: "/cadastros/servicos",
        disabled: true,
      },
      {
        id: "funcionarios",
        label: "Funcionários",
        routePath: "/cadastros/funcionarios",
        disabled: true,
      },
      {
        id: "transportadoras",
        label: "Transportadoras",
        routePath: "/cadastros/transportadoras",
        disabled: true,
      },
      {
        id: "campos_personalizados",
        label: "Campos Personalizados",
        routePath: moduleById.campos?.routePath || "/CadastroCamposPersonalizados",
        moduleId: "campos",
      },
    ],
  },
  {
    id: "financeiro",
    type: "group",
    label: "Financeiro",
    icon: "wallet",
    defaultOpen: false,
    items: [],
    disabled: true,
  },
  {
    id: "estoque",
    type: "group",
    label: "Estoque",
    icon: "boxes",
    defaultOpen: false,
    items: [],
    disabled: true,
  },
  {
    id: "vendas",
    type: "group",
    label: "Vendas",
    icon: "shopping-cart",
    defaultOpen: false,
    items: [],
    disabled: true,
  },
  {
    id: "compras",
    type: "group",
    label: "Compras",
    icon: "shopping-bag",
    defaultOpen: false,
    items: [],
    disabled: true,
  },
  {
    id: "fiscal",
    type: "group",
    label: "Fiscal",
    icon: "file-text",
    defaultOpen: false,
    items: [],
    disabled: true,
  },
  {
    id: "relatorios",
    type: "group",
    label: "Relatórios",
    icon: "bar-chart-3",
    defaultOpen: false,
    items: [],
    disabled: true,
  },
  {
    id: "configuracoes",
    type: "group",
    label: "Configurações",
    icon: "settings",
    defaultOpen: false,
    items: [],
    disabled: true,
  },
];

export const ERP_SUPPORT_LINK = {
  id: "suporte",
  label: "Suporte",
  icon: "help-circle",
  routePath: "/suporte",
  disabled: true,
};

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
