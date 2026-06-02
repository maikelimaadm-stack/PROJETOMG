import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

const getDuplicateGroups = async () =>
  prisma.$queryRawUnsafe(`
    SELECT cliente_id, codigo_empresa, COUNT(*)::int AS total
    FROM "Empresa"
    WHERE cliente_id IS NOT NULL
    GROUP BY cliente_id, codigo_empresa
    HAVING COUNT(*) > 1
  `);

const run = async () => {
  const clientes = await prisma.empresa.groupBy({
    by: ["cliente_id"],
    where: { cliente_id: { not: null } },
  });

  for (const entry of clientes) {
    const clienteId = entry.cliente_id;
    const empresas = await prisma.empresa.findMany({
      where: { cliente_id: clienteId },
      orderBy: [
        { codigo_empresa: "asc" },
        { createdAt: "asc" },
        { id: "asc" },
      ],
      select: { id: true, codigo_empresa: true },
    });
    if (empresas.length === 0) continue;

    const firstByCode = new Map();
    for (const empresa of empresas) {
      const code = Number(empresa.codigo_empresa || 0);
      if (code <= 0) continue;
      if (!firstByCode.has(code)) firstByCode.set(code, empresa.id);
    }

    const maxExistingCode = empresas.reduce(
      (max, empresa) => Math.max(max, Number(empresa.codigo_empresa || 0)),
      0
    );
    let nextCode = Math.max(1, maxExistingCode + 1);

    for (const empresa of empresas) {
      const currentCode = Number(empresa.codigo_empresa || 0);
      const isPrimaryForCode =
        currentCode > 0 && firstByCode.get(currentCode) === empresa.id;

      if (isPrimaryForCode) continue;

      await prisma.empresa.update({
        where: { id: empresa.id },
        data: { codigo_empresa: nextCode },
      });
      nextCode += 1;
    }

    // A sequência oficial é sincronizada depois da migração de schema.
    // Aqui apenas garantimos unicidade prévia para aplicação de constraints.
  }

  const duplicatesAfter = await getDuplicateGroups();
  if (duplicatesAfter.length > 0) {
    throw new Error(
      `Ainda existem códigos duplicados por cliente: ${JSON.stringify(duplicatesAfter)}`
    );
  }
};

run()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Normalização de códigos de empresa concluída com sucesso.");
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error("Falha ao normalizar códigos de empresa:", error.message);
    process.exit(1);
  });

