import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Client } = pg;

const INDEXES = [
  {
    name: "campo_personalizado_global_unique",
    sql: `
      CREATE UNIQUE INDEX IF NOT EXISTS campo_personalizado_global_unique
      ON "CampoPersonalizado" ("cliente_id", "entity_name", "field_name")
      WHERE "empresa_id" IS NULL
    `,
  },
  {
    name: "campo_personalizado_empresa_unique",
    sql: `
      CREATE UNIQUE INDEX IF NOT EXISTS campo_personalizado_empresa_unique
      ON "CampoPersonalizado" ("cliente_id", "entity_name", "field_name", "empresa_id")
      WHERE "empresa_id" IS NOT NULL
    `,
  },
];

const run = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL ausente; índices de campos personalizados não aplicados.");
    return;
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    for (const index of INDEXES) {
      await client.query(index.sql);
      console.log(`Índice ${index.name}: OK`);
    }
  } finally {
    await client.end();
  }
};

run().catch((error) => {
  console.error(`Falha ao garantir índices de campos personalizados: ${error.message}`);
  process.exit(1);
});
