import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { backfillAllClientesIdGlobal } from "../src/modules/idGlobal/idGlobalService.js";
import { seedClienteModulos } from "../src/modules/clienteModulo/clienteModuloService.js";
import { createMigrationPrisma, isRestructureApplied } from "./migrationPrisma.js";
import { runSqlFile, runSqlStatement } from "./sqlRunner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const applySqlPath = path.resolve(__dirname, "supabase/applyRestructure.sql");

const countNullIdGlobal = async (prisma, tableName) => {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS total FROM "${tableName}" WHERE "id_global" IS NULL`
    );
    return Number(rows[0]?.total || 0);
  } catch {
    return 0;
  }
};

const needsIdGlobalBackfill = async (prisma) => {
  const [empresas, campos, anexos, cadastros] = await Promise.all([
    countNullIdGlobal(prisma, "Empresa"),
    countNullIdGlobal(prisma, "CadCpsCampo"),
    countNullIdGlobal(prisma, "RegistroAnexo"),
    countNullIdGlobal(prisma, "CadastroRegistro"),
  ]);
  return empresas + campos + anexos + cadastros > 0;
};

export const runErpRestructure = async ({ exitOnError = false } = {}) => {
  const prisma = createMigrationPrisma();

  try {
    const alreadyApplied = await isRestructureApplied(prisma);
    if (alreadyApplied) {
      console.log("[erp-restructure] Estrutura já aplicada — executando apenas verificações.");
    } else {
      console.log("[erp-restructure] Aplicando reestruturação completa...");
      const statementCount = await runSqlFile(prisma, applySqlPath, fs);
      console.log(`[erp-restructure] SQL aplicado (${statementCount} comando(s)).`);
    }

    for (const table of ["EmpresaCodigoSequencia", "CadCpsCodigoSequencia", "CampoPersonalizado"]) {
      await runSqlStatement(prisma, `DROP TABLE IF EXISTS "${table}" CASCADE`);
    }

    if (await needsIdGlobalBackfill(prisma)) {
      const results = await backfillAllClientesIdGlobal();
      const total = results.reduce((sum, item) => sum + item.assigned, 0);
      console.log(`[erp-restructure] Backfill ID Global: ${total} registro(s).`);
    }

    const modulosSeeded = await seedClienteModulos(prisma);
    console.log(`[erp-restructure] Módulos garantidos para ${modulosSeeded} cliente(s).`);
    console.log("[erp-restructure] Concluído com sucesso.");
  } catch (error) {
    console.error("[erp-restructure] Falha:", error.message);
    if (exitOnError) process.exit(1);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  runErpRestructure({ exitOnError: true });
}
