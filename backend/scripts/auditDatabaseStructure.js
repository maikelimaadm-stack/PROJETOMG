import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const EXPECTED_TABLES = {
  Cliente: {
    layer: "saas",
    operational: false,
    columns: ["id", "codigo", "nome", "ativo", "createdAt", "updatedAt"],
  },
  Usuario: {
    layer: "saas",
    operational: false,
    columns: [
      "id",
      "cliente_id",
      "login",
      "senha_hash",
      "perfil",
      "acesso_global",
      "ativo",
      "createdAt",
      "updatedAt",
    ],
  },
  Empresa: {
    layer: "operacional",
    operational: true,
    columns: [
      "id",
      "tenant_id",
      "cliente_id",
      "id_global",
      "codempresa",
      "razao_social",
      "nome_fantasia",
      "tipo_pessoa",
      "tipo_vinculo",
      "cpf_cnpj",
      "inscricao_estadual",
      "telefone",
      "whatsapp",
      "email",
      "logo_url",
      "cep",
      "endereco",
      "numero",
      "bairro",
      "cidade",
      "estado",
      "observacoes",
      "status",
      "campos_personalizados",
      "createdAt",
      "updatedAt",
    ],
  },
  CampoPersonalizado: {
    layer: "operacional-legado",
    operational: true,
    columns: [
      "id",
      "tenant_id",
      "cliente_id",
      "id_global",
      "empresa_id",
      "codempresa",
      "nome_empresa",
      "entity_name",
      "field_name",
      "label",
      "placeholder",
      "descricao",
      "tipo",
      "ordem_tabela",
      "largura_coluna",
      "obrigatorio",
      "read_only",
      "visivel_form",
      "visivel_tabela",
      "visivel_relatorio",
      "ativo",
      "opcoes",
      "options_source",
      "options_label_field",
      "options_value_field",
      "formula",
      "usar_decimal",
      "decimal_places",
      "usar_mascara",
      "mascaras_text",
      "createdAt",
      "updatedAt",
    ],
  },
  CadCpsTela: {
    layer: "catalogo",
    operational: false,
    columns: ["id", "codigo", "nome", "entity_name", "ativo", "ordem", "createdAt", "updatedAt"],
  },
  CadCpsCampo: {
    layer: "operacional",
    operational: true,
    columns: [
      "id",
      "cliente_id",
      "id_global",
      "codigo",
      "nome",
      "field_name",
      "descricao",
      "tipo",
      "ativo",
      "obrigatorio",
      "read_only",
      "visivel_form",
      "visivel_tabela",
      "visivel_relatorio",
      "pesquisavel",
      "filtravel",
      "exportavel",
      "auditavel",
      "aplicacao_modo",
      "placeholder",
      "formula",
      "calculation_builder",
      "usar_mascara",
      "mascaras_text",
      "usar_decimal",
      "decimal_places",
      "separador_decimal",
      "separador_milhar",
      "ordem_tabela",
      "largura_coluna",
      "relation_entity",
      "options_label_field",
      "options_value_field",
      "legacy_campo_id",
      "created_by",
      "updated_by",
      "createdAt",
      "updatedAt",
    ],
  },
  CadCpsCampoTela: {
    layer: "catalogo",
    operational: false,
    columns: ["campo_id", "tela_id"],
  },
  CadCpsCampoEmpresa: {
    layer: "catalogo",
    operational: false,
    columns: ["campo_id", "empresa_id"],
  },
  CadCpsCampoOpcao: {
    layer: "catalogo",
    operational: false,
    columns: ["id", "campo_id", "codigo", "descricao", "ordem", "ativo", "createdAt", "updatedAt"],
  },
  CadCpsHistorico: {
    layer: "auditoria",
    operational: false,
    columns: [
      "id",
      "cliente_id",
      "campo_id",
      "usuario_id",
      "acao",
      "valor_anterior",
      "valor_novo",
      "createdAt",
    ],
  },
  CadCpsCodigoSequencia: {
    layer: "sequencia-codigo",
    operational: false,
    note: "Sequência do CÓDIGO do campo CADCPS (não é ID Global)",
    columns: ["id", "cliente_id", "next_codigo", "createdAt", "updatedAt"],
  },
  CadastroRegistro: {
    layer: "operacional",
    operational: true,
    columns: [
      "id",
      "cliente_id",
      "id_global",
      "empresa_id",
      "codempresa",
      "nome_empresa",
      "entity_name",
      "nome",
      "status",
      "observacoes",
      "campos_personalizados",
      "createdAt",
      "updatedAt",
    ],
  },
  RegistroAnexo: {
    layer: "operacional",
    operational: true,
    columns: [
      "id",
      "tenant_id",
      "cliente_id",
      "id_global",
      "entity_name",
      "record_id",
      "empresa_id",
      "codempresa",
      "nome_empresa",
      "attachment_name",
      "file_name",
      "file_url",
      "storage_path",
      "file_type",
      "file_size",
      "createdAt",
      "updatedAt",
    ],
  },
  PermissaoEmpresa: {
    layer: "seguranca",
    operational: false,
    columns: ["usuario_id", "empresa_id", "createdAt"],
  },
  ClienteIdGlobalSequencia: {
    layer: "sequencia-id-global",
    operational: false,
    note: "ÚNICO contador corporativo de ID Global por cliente",
    columns: ["id", "cliente_id", "next_id_global", "createdAt", "updatedAt"],
  },
  registro_global: {
    layer: "indice-id-global",
    operational: false,
    note: "Índice de todos os registros operacionais com ID Global",
    columns: ["id", "cliente_id", "id_global", "entity_name", "registro_id", "createdAt"],
  },
  EmpresaCodigoSequencia: {
    layer: "sequencia-codigo",
    operational: false,
    note: "Sequência do CÓDIGO da empresa (codempresa — não é ID Global)",
    columns: ["id", "cliente_id", "next_codigo", "createdAt", "updatedAt"],
  },
  AuditLog: {
    layer: "auditoria",
    operational: false,
    columns: [
      "id",
      "cliente_id",
      "id_global",
      "usuario_id",
      "empresa_id",
      "codempresa",
      "nome_empresa",
      "entity_name",
      "entity_id",
      "action",
      "payload",
      "createdAt",
    ],
  },
  UsuarioPreferencia: {
    layer: "preferencias",
    operational: false,
    columns: ["id", "usuario_id", "cliente_id", "screen_key", "config", "createdAt", "updatedAt"],
  },
};

const ID_GLOBAL_CRITICAL = [
  "ClienteIdGlobalSequencia",
  "registro_global",
  "Empresa.id_global",
  "CadCpsCampo.id_global",
  "CadastroRegistro.id_global",
  "RegistroAnexo.id_global",
  "CampoPersonalizado.id_global",
  "AuditLog.id_global",
];

const fetchTables = async () => {
  const rows = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  return rows.map((row) => row.table_name);
};

const fetchColumns = async (tableName) => {
  const rows = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${tableName}
    ORDER BY ordinal_position
  `;
  return rows;
};

const fetchMigrations = async () => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT migration_name, finished_at, applied_steps_count
      FROM "_prisma_migrations"
      ORDER BY finished_at
    `;
    return rows;
  } catch {
    return null;
  }
};

const fetchCounts = async (tableName) => {
  try {
    const quoted = tableName === "registro_global" ? '"registro_global"' : `"${tableName}"`;
    const rows = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS total FROM ${quoted}`);
    return rows[0]?.total ?? 0;
  } catch {
    return null;
  }
};

const printSection = (title) => {
  console.log(`\n${"=".repeat(72)}`);
  console.log(title);
  console.log("=".repeat(72));
};

const run = async () => {
  printSection("AUDITORIA DO BANCO — ERP PROJETOMG");
  console.log(`Data: ${new Date().toISOString()}`);
  console.log(`DATABASE_URL configurada: ${Boolean(process.env.DATABASE_URL)}`);

  const tables = await fetchTables();
  const migrations = await fetchMigrations();

  printSection("1) TABELAS EXISTENTES NO BANCO");
  for (const table of tables) {
    const count = await fetchCounts(table);
    console.log(`- ${table}${count != null ? ` (${count} registros)` : ""}`);
  }

  printSection("2) MIGRATIONS PRISMA APLICADAS");
  if (!migrations) {
    console.log("Tabela _prisma_migrations não encontrada ou inacessível.");
  } else if (migrations.length === 0) {
    console.log("Nenhuma migration registrada.");
  } else {
    for (const migration of migrations) {
      console.log(
        `- ${migration.migration_name} | steps=${migration.applied_steps_count} | finished=${migration.finished_at}`
      );
    }
  }

  printSection("3) COMPARATIVO — ESPERADO vs BANCO");
  const missingTables = [];
  const tablesWithMissingColumns = [];

  for (const [tableName, spec] of Object.entries(EXPECTED_TABLES)) {
    const exists = tables.includes(tableName);
    if (!exists) {
      missingTables.push({ tableName, ...spec });
      console.log(`❌ TABELA AUSENTE: ${tableName} [${spec.layer}]`);
      continue;
    }

    const columns = await fetchColumns(tableName);
    const actualNames = columns.map((col) => col.column_name);
    const missingCols = spec.columns.filter((col) => !actualNames.includes(col));

    console.log(`✅ TABELA OK: ${tableName} [${spec.layer}] — ${actualNames.length} colunas`);
    if (spec.note) console.log(`   ↳ ${spec.note}`);

    if (missingCols.length > 0) {
      tablesWithMissingColumns.push({ tableName, missingCols, layer: spec.layer });
      console.log(`   ⚠️  Colunas faltando: ${missingCols.join(", ")}`);
    }
  }

  printSection("4) ID GLOBAL — CHECKLIST CRÍTICO");
  for (const item of ID_GLOBAL_CRITICAL) {
    if (item.includes(".")) {
      const [table, column] = item.split(".");
      const exists = tables.includes(table);
      if (!exists) {
        console.log(`❌ ${item} — tabela ${table} não existe`);
        continue;
      }
      const columns = await fetchColumns(table);
      const hasColumn = columns.some((col) => col.column_name === column);
      console.log(`${hasColumn ? "✅" : "❌"} ${item}`);
      continue;
    }
    const exists = tables.includes(item);
    console.log(`${exists ? "✅" : "❌"} ${item}`);
  }

  if (tables.includes("Empresa")) {
    const rows = await prisma.$queryRaw`
      SELECT
        COUNT(*)::int AS total,
        COUNT("id_global")::int AS com_id_global,
        COUNT(*)::int - COUNT("id_global")::int AS sem_id_global
      FROM "Empresa"
    `;
    const stat = rows[0];
    console.log(
      `\nEmpresa: total=${stat.total}, com id_global=${stat.com_id_global}, sem id_global=${stat.sem_id_global}`
    );
  }

  if (tables.includes("registro_global")) {
    const rows = await prisma.$queryRaw`SELECT COUNT(*)::int AS total FROM "registro_global"`;
    console.log(`registro_global: total=${rows[0].total}`);
  }

  printSection("5) ESTRUTURA DETALHADA POR TABELA");
  for (const tableName of Object.keys(EXPECTED_TABLES).sort()) {
    if (!tables.includes(tableName)) continue;
    const columns = await fetchColumns(tableName);
    console.log(`\n[${tableName}]`);
    for (const col of columns) {
      console.log(
        `  - ${col.column_name}: ${col.data_type} ${col.is_nullable === "YES" ? "NULL" : "NOT NULL"}${col.column_default ? ` default=${col.column_default}` : ""}`
      );
    }
  }

  printSection("6) DIAGNÓSTICO");
  const idGlobalTableMissing = !tables.includes("ClienteIdGlobalSequencia");
  const registroGlobalMissing = !tables.includes("registro_global");
  const empresaIdGlobalMissing = tables.includes("Empresa")
    ? !(await fetchColumns("Empresa")).some((col) => col.column_name === "id_global")
    : true;

  if (idGlobalTableMissing || registroGlobalMissing || empresaIdGlobalMissing) {
    console.log("CAUSA PROVÁVEL DO ERRO:");
    console.log(
      "A migration 20260604120000_id_global_corporativo NÃO foi aplicada neste banco."
    );
    console.log("\nCORREÇÃO:");
    console.log("  cd backend");
    console.log("  npm run ensure:id-global");
    console.log("  # ou: npx prisma migrate deploy && npm run backfill:id-global");
  } else {
    console.log("Estrutura ID Global presente. Se ainda há erro, verifique:");
    console.log("- Backend reiniciado após migration");
    console.log("- prisma generate executado");
    console.log("- Backfill executado (registros com id_global NULL)");
  }

  if (missingTables.length > 0) {
    console.log(`\nTabelas ausentes: ${missingTables.length}`);
  }
  if (tablesWithMissingColumns.length > 0) {
    console.log(`Tabelas com colunas ausentes: ${tablesWithMissingColumns.length}`);
  }

  printSection("FIM DA AUDITORIA");
};

run()
  .catch((error) => {
    console.error("\nFalha na auditoria:", error.message);
    console.error("\nVerifique DATABASE_URL / DIRECT_URL no backend/.env");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
