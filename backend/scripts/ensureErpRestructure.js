import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { backfillAllClientesIdGlobal } from "../src/modules/idGlobal/idGlobalService.js";
import { migrateLegacyCodigoSequencias } from "../src/modules/sequencias/entidadeCodigoService.js";
import { seedClienteModulos } from "../src/modules/clienteModulo/clienteModuloService.js";
import { runSqlFile, runSqlStatement } from "./sqlRunner.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.resolve(
  __dirname,
  "../prisma/migrations/20260604200000_erp_restructure_definitivo/migration.sql"
);

const prisma = new PrismaClient();

const countNullIdGlobal = async (tableName) => {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS total FROM "${tableName}" WHERE "id_global" IS NULL`
    );
    return Number(rows[0]?.total || 0);
  } catch {
    return 0;
  }
};

const needsIdGlobalBackfill = async () => {
  const [empresas, campos, anexos, cadastros] = await Promise.all([
    countNullIdGlobal("Empresa"),
    countNullIdGlobal("CadCpsCampo"),
    countNullIdGlobal("RegistroAnexo"),
    countNullIdGlobal("CadastroRegistro"),
  ]);
  return empresas + campos + anexos + cadastros > 0;
};

const backfillCadastroRegistroCodigo = async () => {
  let assigned = 0;

  try {
    const clientes = await prisma.cliente.findMany({ select: { id: true } });

    for (const cliente of clientes) {
      const rows = await prisma.$queryRaw`
        SELECT id, entity_name, codigo FROM "CadastroRegistro"
        WHERE cliente_id = ${cliente.id} AND codigo IS NULL
        ORDER BY "createdAt" ASC
      `;

      const byEntity = new Map();
      for (const row of rows) {
        const key = row.entity_name;
        if (!byEntity.has(key)) byEntity.set(key, []);
        byEntity.get(key).push(row);
      }

      for (const [entityName, entityRows] of byEntity) {
        const maxRow = await prisma.$queryRaw`
          SELECT COALESCE(MAX(codigo), 0)::int AS max_codigo
          FROM "CadastroRegistro"
          WHERE cliente_id = ${cliente.id} AND entity_name = ${entityName}
        `;
        let nextCodigo = Number(maxRow[0]?.max_codigo || 0) + 1;

        for (const row of entityRows) {
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
  } catch (error) {
    if (!String(error?.message || "").includes("CadastroRegistro")) {
      throw error;
    }
    console.warn("[erp-restructure] Backfill codigo ignorado:", error.message);
  }

  return assigned;
};

const run = async () => {
  // Migrar sequências legadas ANTES de dropar as tabelas antigas
  const migratedSeq = await migrateLegacyCodigoSequencias(prisma);
  console.log(`[erp-restructure] Sequências legadas migradas: ${migratedSeq} registro(s).`);

  const statementCount = await runSqlFile(prisma, migrationPath, fs);
  console.log(`[erp-restructure] DDL aplicado (${statementCount} comando(s)).`);

  // Garantir DROP com CASCADE para tabelas legadas remanescentes
  for (const table of ["EmpresaCodigoSequencia", "CadCpsCodigoSequencia", "CampoPersonalizado"]) {
    await runSqlStatement(prisma, `DROP TABLE IF EXISTS "${table}" CASCADE`);
  }

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
