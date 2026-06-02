import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Client } = pg;

const RENAMES = [
  { table: "Empresa", from: "codigo_empresa", to: "codempresa" },
  { table: "CampoPersonalizado", from: "codigo_empresa", to: "codempresa" },
  { table: "CadastroRegistro", from: "codigo_empresa", to: "codempresa" },
  { table: "RegistroAnexo", from: "codigo_empresa", to: "codempresa" },
  { table: "AuditLog", from: "codigo_empresa", to: "codempresa" },
];

const run = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL ausente; migração codempresa não executada.");
    return;
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    for (const rename of RENAMES) {
      const exists = await client.query(
        `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
        [rename.table, rename.from]
      );
      if (exists.rowCount === 0) {
        console.log(`${rename.table}.${rename.from}: já renomeado ou inexistente`);
        continue;
      }
      await client.query(
        `ALTER TABLE "${rename.table}" RENAME COLUMN "${rename.from}" TO "${rename.to}"`
      );
      console.log(`${rename.table}.${rename.from} → ${rename.to}: OK`);
    }

    const tipoVinculoExists = await client.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'Empresa' AND column_name = 'tipo_vinculo'`
    );
    if (tipoVinculoExists.rowCount === 0) {
      await client.query(
        `ALTER TABLE "Empresa" ADD COLUMN IF NOT EXISTS "tipo_vinculo" VARCHAR(32)`
      );
      console.log("Empresa.tipo_vinculo: OK");
    }
  } finally {
    await client.end();
  }
};

run().catch((error) => {
  console.error(`Falha na migração codempresa: ${error.message}`);
  process.exit(1);
});
