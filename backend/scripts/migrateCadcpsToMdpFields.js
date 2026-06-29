import {
  buildStableFieldId,
  CADCPS_APLICACAO_TO_MDP,
  DEFAULT_LOCALE,
  MDP_PLATFORM_VERSION_ID,
} from "../src/modules/mdp/mdpFieldConstants.js";
import { buildLabelCreate } from "../src/modules/mdp/mdpFieldCadcpsAdapter.js";
import { normalizeCadcpsTipo } from "../src/modules/cadcps/cadcpsConstants.js";

/**
 * Migrates legacy CadCpsCampo* rows into mdp_field* (one-time / idempotent per campo).
 */
export const migrateCadcpsToMdpFields = async (prisma, { clienteId } = {}) => {
  const where = clienteId ? { cliente_id: clienteId } : {};
  const legacyCampos = await prisma.cadCpsCampo.findMany({
    where,
    include: {
      telas: { include: { tela: true } },
      empresas: true,
      opcoes: { orderBy: { ordem: "asc" } },
    },
  });

  let migrated = 0;
  let skipped = 0;

  for (const campo of legacyCampos) {
    const already = await prisma.mdpField.findFirst({
      where: { legacy_campo_id: campo.id },
    });
    if (already) {
      skipped += 1;
      continue;
    }

    const tela = campo.telas[0]?.tela;
    const entityName = tela?.entity_name || "EmpresaCadastro";
    const entity = await prisma.mdpEntity.findFirst({
      where: {
        entity_id: entityName,
        OR: [
          { scope: "platform", cliente_id: null },
          { scope: "tenant", cliente_id: campo.cliente_id },
        ],
      },
    });
    if (!entity) {
      skipped += 1;
      continue;
    }

    const stableFieldId = buildStableFieldId(entityName, campo.field_name);
    const existingMdp = await prisma.mdpField.findFirst({
      where: {
        cliente_id: campo.cliente_id,
        field_name: campo.field_name,
        entity_row_id: entity.id,
      },
    });
    if (existingMdp) {
      skipped += 1;
      continue;
    }

    const aplicacao =
      CADCPS_APLICACAO_TO_MDP[campo.aplicacao_modo] || "all";

    const created = await prisma.mdpField.create({
      data: {
        field_id: stableFieldId,
        entity_row_id: entity.id,
        field_name: campo.field_name,
        source: "custom",
        field_type: normalizeCadcpsTipo(campo.tipo),
        scope: "tenant",
        cliente_id: campo.cliente_id,
        codigo: campo.codigo,
        id_global: campo.id_global,
        active: campo.ativo,
        required: campo.obrigatorio,
        read_only: campo.read_only,
        searchable: campo.pesquisavel,
        filterable: campo.filtravel,
        exportable: campo.exportavel,
        auditable: campo.auditavel,
        visible_form: campo.visivel_form,
        visible_table: campo.visivel_tabela,
        visible_report: campo.visivel_relatorio,
        empresa_applicability: aplicacao,
        placeholder: campo.placeholder,
        formula: campo.formula,
        calculation_builder: campo.calculation_builder ?? undefined,
        use_mask: campo.usar_mascara,
        mask_text: campo.mascaras_text,
        use_decimal: campo.usar_decimal,
        decimal_places: campo.decimal_places,
        decimal_separator: campo.separador_decimal,
        thousand_separator: campo.separador_milhar,
        table_order: campo.ordem_tabela,
        column_width: campo.largura_coluna,
        relation_entity: campo.relation_entity,
        options_label_field: campo.options_label_field,
        options_value_field: campo.options_value_field,
        legacy_campo_id: campo.id,
        base_template_id: "modelobase1",
        lifecycle: "active",
        sort_order: campo.ordem_tabela,
        version_id: MDP_PLATFORM_VERSION_ID,
        created_by: campo.created_by,
        updated_by: campo.updated_by,
        created_at: campo.createdAt,
        updated_at: campo.updatedAt,
        labels: {
          create: buildLabelCreate(campo.nome, campo.descricao, campo.placeholder),
        },
      },
    });

    if (campo.telas.length) {
      await prisma.mdpFieldTela.createMany({
        data: campo.telas.map((link) => ({
          field_row_id: created.id,
          tela_id: link.tela_id,
        })),
        skipDuplicates: true,
      });
    }

    if (aplicacao === "selected" && campo.empresas.length) {
      await prisma.mdpFieldEmpresaScope.createMany({
        data: campo.empresas.map((link) => ({
          field_row_id: created.id,
          empresa_id: link.empresa_id,
        })),
        skipDuplicates: true,
      });
    }

    if (campo.opcoes.length) {
      await prisma.mdpFieldOption.createMany({
        data: campo.opcoes.map((o) => ({
          field_row_id: created.id,
          code: o.codigo,
          label: o.descricao,
          sort_order: o.ordem,
          active: o.ativo,
        })),
      });
    }

    const historicos = await prisma.cadCpsHistorico.findMany({
      where: { campo_id: campo.id },
      orderBy: { createdAt: "asc" },
    });
    for (const h of historicos) {
      await prisma.mdpFieldAudit.create({
        data: {
          field_row_id: created.id,
          cliente_id: h.cliente_id,
          action: h.acao,
          before: h.valor_anterior ?? undefined,
          after: h.valor_novo ?? undefined,
          usuario_id: h.usuario_id,
          created_at: h.createdAt,
        },
      });
    }

    migrated += 1;
  }

  return { migrated, skipped, total: legacyCampos.length };
};
