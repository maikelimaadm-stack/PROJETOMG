import dotenv from "dotenv";
import { getPrismaClient } from "../src/database/prismaClient.js";
import { repCps } from "../src/modules/cadcps/repCps.js";
import { LEGACY_TIPO_TO_CADCPS, CADCPS_APLICACAO } from "../src/modules/cadcps/cadcpsConstants.js";

dotenv.config();

const toSnake = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

const run = async () => {
  const prisma = getPrismaClient();
  await repCps.ensureTelasSeed();
  const telas = await prisma.cadCpsTela.findMany();
  const telaByEntity = Object.fromEntries(telas.map((t) => [t.entity_name, t.id]));

  const legacyRows = await prisma.campoPersonalizado.findMany({ orderBy: { createdAt: "asc" } });
  let migrated = 0;
  let skipped = 0;

  for (const row of legacyRows) {
    const exists = await prisma.cadCpsCampo.findFirst({
      where: { legacy_campo_id: row.id },
    });
    if (exists) {
      skipped += 1;
      continue;
    }

    const telaId = telaByEntity[row.entity_name] || telaByEntity.EmpresaCadastro;
    if (!telaId) {
      console.warn(`Tela não encontrada para entity ${row.entity_name}, campo ${row.id}`);
      skipped += 1;
      continue;
    }

    const tipo = LEGACY_TIPO_TO_CADCPS[row.tipo] || row.tipo;
    const opcoes = Array.isArray(row.opcoes)
      ? row.opcoes
      : row.opcoes && typeof row.opcoes === "object"
        ? Object.values(row.opcoes)
        : [];

    const seq = await prisma.cadCpsCodigoSequencia.upsert({
      where: { cliente_id: row.cliente_id },
      create: { cliente_id: row.cliente_id, next_codigo: (row.ordem_tabela || 0) + 2 },
      update: {},
    });
    const codigo = seq.next_codigo;
    await prisma.cadCpsCodigoSequencia.update({
      where: { cliente_id: row.cliente_id },
      data: { next_codigo: codigo + 1 },
    });

    const aplicacao_modo = row.empresa_id ? CADCPS_APLICACAO.ESPECIFICAS : CADCPS_APLICACAO.TODAS;

    const created = await prisma.cadCpsCampo.create({
      data: {
        cliente_id: row.cliente_id,
        codigo,
        nome: row.label,
        field_name: row.field_name || toSnake(row.label),
        descricao: row.descricao,
        tipo,
        ativo: row.ativo,
        obrigatorio: row.obrigatorio,
        read_only: row.read_only,
        visivel_form: row.visivel_form,
        visivel_tabela: row.visivel_tabela,
        visivel_relatorio: row.visivel_relatorio,
        aplicacao_modo,
        placeholder: row.placeholder,
        formula: row.formula,
        usar_mascara: row.usar_mascara,
        mascaras_text: row.mascaras_text,
        usar_decimal: row.usar_decimal,
        decimal_places: row.decimal_places ?? 2,
        ordem_tabela: row.ordem_tabela ?? 999,
        largura_coluna: row.largura_coluna ?? 160,
        relation_entity: row.options_source,
        options_label_field: row.options_label_field,
        options_value_field: row.options_value_field,
        legacy_campo_id: row.id,
      },
    });

    await prisma.cadCpsCampoTela.create({
      data: { campo_id: created.id, tela_id: telaId },
    });

    if (row.empresa_id) {
      await prisma.cadCpsCampoEmpresa.create({
        data: { campo_id: created.id, empresa_id: row.empresa_id },
      });
    }

    if (opcoes.length) {
      await prisma.cadCpsCampoOpcao.createMany({
        data: opcoes.map((opcao, index) => ({
          campo_id: created.id,
          codigo: String(opcao.value || opcao.codigo || opcao.label || index + 1),
          descricao: String(opcao.label || opcao.descricao || opcao.value || index + 1),
          ordem: index,
          ativo: true,
        })),
      });
    }

    migrated += 1;
  }

  console.log(`Migração CADCPS: ${migrated} migrados, ${skipped} ignorados.`);
  await prisma.$disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
