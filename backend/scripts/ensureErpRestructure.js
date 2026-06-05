import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { backfillAllClientesIdGlobal } from "../src/modules/idGlobal/idGlobalService.js";
import { migrateLegacyCodigoSequencias } from "../src/modules/sequencias/entidadeCodigoService.js";
import { seedClienteModulos } from "../src/modules/clienteModulo/clienteModuloService.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.resolve(
  __dirname,
  "../prisma/migrations/20260604200000_erp_restructure_definitivo/migration.sql"
);

const prisma = new PrismaClient();

const IGNORED_ERROR_CODES = new Set(["42P07", "42710", "42P16", "42701"]);

const splitSqlStatements = (sql) =>
  sql
    .replace(/--[^\n]*/g, "")
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean);

const runStatement = async (statement) => {
  try {
    await prisma.$executeRawUnsafe(statement);
  } catch (error) {
    const code = error?.code || error?.meta?.code;
    if (IGNORED_ERROR_CODES.has(code)) return;
    const message = String(error?.message || "");
    if (message.includes("already exists")) return;
    if (message.includes("does not exist") && message.includes("DROP")) return;
    throw error;
  }
};

const needsIdGlobalBackfill = async () => {
  const [empresas, campos, anexos, cadastros] = await Promise.all([
    prisma.empresa.count({ where: { id_global: null } }),
    prisma.cadCpsCampo.count({ where: { id_global: null } }),
    prisma.registroAnexo.count({ where: { id_global: null } }),
    prisma.cadastroRegistro.count({ where: { id_global: null } }),
  ]);
  return empresas + campos + anexos + cadastros > 0;
};

const backfillCadastroRegistroCodigo = async () => {
  const clientes = await prisma.cliente.findMany({ select: { id: true } });
  let assigned = 0;

  for (const cliente of clientes) {
    const entityNames = await prisma.cadastroRegistro.findMany({
      where: { cliente_id: cliente.id, codigo: null },
      distinct: ["entity_name"],
      select: { entity_name: true },
    });

    for (const { entity_name: entityName } of entityNames) {
      const rows = await prisma.cadastroRegistro.findMany({
        where: { cliente_id: cliente.id, entity_name: entityName },
        orderBy: { createdAt: "asc" },
        select: { id: true, codigo: true },
      });

      let nextCodigo = 1;
      const maxExisting = rows.reduce((max, row) => Math.max(max, Number(row.codigo) || 0), 0);
      nextCodigo = maxExisting + 1;

      for (const row of rows) {
        if (row.codigo != null) continue;
        await prisma.cadastroRegistro.update({
          where: { id: row.id },
          data: { codigo: nextCodigo },
        });
        nextCodigo += 1;
        assigned += 1;
      }

      await prisma.entidadeCodigoSequencia.upsert({
        where: {
          cliente_id_entity_name: {
            cliente_id: cliente.id,
            entity_name: entityName,
          },
        },
        create: {
          cliente_id: cliente.id,
          entity_name: entityName,
          next_codigo: nextCodigo,
        },
        update: {
          next_codigo: { set: Math.max(nextCodigo, 1) },
        },
      });
    }
  }

  return assigned;
};

const run = async () => {
  const sql = fs.readFileSync(migrationPath, "utf8");
  const statements = splitSqlStatements(sql);
  for (const statement of statements) {
    await runStatement(`${statement};`);
  }
  console.log(`[erp-restructure] DDL aplicado (${statements.length} comando(s)).`);

  const migratedSeq = await migrateLegacyCodigoSequencias(prisma);
  console.log(`[erp-restructure] Sequências migradas: ${migratedSeq} registro(s).`);

  if (await needsIdGlobalBackfill()) {
    const results = await backfillAllClientesIdGlobal();
    const total = results.reduce((sum, item) => sum + item.assigned, 0);
    console.log(`[erp-restructure] Backfill ID Global: ${total} registro(s).`);
  } else {
    console.log("[erp-restructure] Backfill ID Global não necessário.");
  }

  const codigoAssigned = await backfillCadastroRegistroCodigo();
  console.log(`[erp-restructure] Backfill CadastroRegistro.codigo: ${codigoAssigned} registro(s).`);

  const modulosSeeded = await seedClienteModulos(prisma);
  console.log(`[erp-restructure] Módulos padrão garantidos: ${modulosSeeded} cliente(s).`);
};

run()
  .catch((error) => {
    console.error("[erp-restructure] Falha:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
