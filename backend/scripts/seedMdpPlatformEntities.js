import {
  DEFAULT_CAPABILITIES,
  DEFAULT_LOCALE,
  MDP_ENTITY_IDS,
  MDP_PLATFORM_VERSION_ID,
} from "../src/modules/mdp/mdpEntityConstants.js";

const PLATFORM_ENTITIES = [
  {
    id: MDP_ENTITY_IDS.empresas,
    entity_id: "EmpresaCadastro",
    module_id: "empresas",
    codigo: "EMPRESAS",
    entity_kind: "business",
    sort_order: 10,
    icon_key: "building",
    legacy_entity_name: "EmpresaCadastro",
    permission_resource_key: "empresas",
    base_template_id: "modelobase1",
    empresa_scope: "required",
    is_runtime_module: true,
    persistence: {
      prismaModel: "Empresa",
      tableName: "Empresa",
      primaryKey: "id",
      tenantKey: "cliente_id",
      empresaKey: "empresa_id",
      idGlobalKey: "id_global",
    },
    labels: {
      locale: DEFAULT_LOCALE,
      singular: "Empresa",
      plural: "Empresas",
      description: "Cadastro oficial de empresas do tenant",
    },
    routes: [
      {
        route_path: "/CadastroEmpresas",
        page_code: "PAGEMP",
        client_target: "all",
        menu_section: "cadastro",
        sort_order: 10,
        target_entity_id: null,
      },
    ],
  },
  {
    id: MDP_ENTITY_IDS.cadcps,
    entity_id: "CadcpsFieldCatalog",
    module_id: "cadcps",
    codigo: "CADCPS",
    entity_kind: "meta",
    sort_order: 40,
    icon_key: "sliders",
    legacy_entity_name: "CadCpsCampo",
    permission_resource_key: "cadcps",
    base_template_id: "modelobase1",
    empresa_scope: "none",
    is_runtime_module: true,
    persistence: {
      prismaModel: "MdpField",
      tableName: "mdp_field",
      primaryKey: "id",
      tenantKey: "cliente_id",
      empresaKey: null,
      idGlobalKey: "id_global",
      legacyModel: "CadCpsCampo",
    },
    labels: {
      locale: DEFAULT_LOCALE,
      singular: "Campo Personalizado",
      plural: "Campos Personalizados",
      description: "Catálogo administrativo de campos personalizados (MDP-2 evolution)",
    },
    routes: [
      {
        route_path: "/CadastroCamposPersonalizados",
        page_code: "PAGCPS",
        client_target: "all",
        menu_section: "admin",
        sort_order: 40,
        target_entity_id: null,
      },
      {
        route_path: "/CadastroEmpresas",
        page_code: "PAGEMP",
        client_target: "all",
        menu_section: "cadcps-target",
        sort_order: 10,
        target_entity_id: "EmpresaCadastro",
      },
    ],
  },
];

export const seedMdpPlatformEntities = async (prisma) => {
  await prisma.mdpDefinitionVersion.upsert({
    where: { id: MDP_PLATFORM_VERSION_ID },
    create: {
      id: MDP_PLATFORM_VERSION_ID,
      cliente_id: null,
      module_id: null,
      semver: "1.0.0",
      revision: 1,
      status: "published",
      published_at: new Date(),
      published_by: "system",
      changelog: "MDP-1 platform bootstrap",
    },
    update: {
      status: "published",
      semver: "1.0.0",
      revision: 1,
    },
  });

  let seeded = 0;
  for (const entity of PLATFORM_ENTITIES) {
    await prisma.mdpEntity.upsert({
      where: { id: entity.id },
      create: {
        id: entity.id,
        entity_id: entity.entity_id,
        module_id: entity.module_id,
        codigo: entity.codigo,
        scope: "platform",
        cliente_id: null,
        entity_kind: entity.entity_kind,
        sort_order: entity.sort_order,
        icon_key: entity.icon_key,
        origin_kind: "platform",
        origin_ref: "platform",
        is_runtime_module: entity.is_runtime_module,
        legacy_entity_name: entity.legacy_entity_name,
        permission_resource_key: entity.permission_resource_key,
        base_template_id: entity.base_template_id,
        empresa_scope: entity.empresa_scope,
        lifecycle: "active",
        version_id: MDP_PLATFORM_VERSION_ID,
        persistence: entity.persistence,
        labels: {
          create: [entity.labels],
        },
        capabilities: {
          create: { ...DEFAULT_CAPABILITIES },
        },
        routes: {
          create: entity.routes,
        },
      },
      update: {
        entity_id: entity.entity_id,
        module_id: entity.module_id,
        codigo: entity.codigo,
        entity_kind: entity.entity_kind,
        sort_order: entity.sort_order,
        icon_key: entity.icon_key,
        legacy_entity_name: entity.legacy_entity_name,
        permission_resource_key: entity.permission_resource_key,
        base_template_id: entity.base_template_id,
        empresa_scope: entity.empresa_scope,
        is_runtime_module: entity.is_runtime_module,
        lifecycle: "active",
        persistence: entity.persistence,
      },
    });

    await prisma.mdpEntityLabel.upsert({
      where: {
        entity_id_locale: {
          entity_id: entity.id,
          locale: entity.labels.locale,
        },
      },
      create: {
        entity_id: entity.id,
        locale: entity.labels.locale,
        singular: entity.labels.singular,
        plural: entity.labels.plural,
        description: entity.labels.description,
      },
      update: {
        singular: entity.labels.singular,
        plural: entity.labels.plural,
        description: entity.labels.description,
      },
    });

    await prisma.mdpEntityCapability.upsert({
      where: { entity_id: entity.id },
      create: { entity_id: entity.id, ...DEFAULT_CAPABILITIES },
      update: { ...DEFAULT_CAPABILITIES },
    });

    await prisma.mdpEntityRoute.deleteMany({ where: { entity_id: entity.id } });
    if (entity.routes.length) {
      await prisma.mdpEntityRoute.createMany({
        data: entity.routes.map((route) => ({
          entity_id: entity.id,
          route_path: route.route_path,
          page_code: route.page_code,
          client_target: route.client_target,
          menu_section: route.menu_section,
          sort_order: route.sort_order,
          target_entity_id: route.target_entity_id,
        })),
      });
    }

    seeded += 1;
  }

  return seeded;
};
