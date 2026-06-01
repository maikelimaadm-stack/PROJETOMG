import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const required = [
  "DATABASE_URL",
  "DIRECT_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Variaveis ausentes: ${missing.join(", ")}`);
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  await prisma.$queryRaw`SELECT 1`;
  console.log("PostgreSQL: OK");
} catch (error) {
  console.error(`PostgreSQL: FALHA (${error.message})`);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { error: storageError } = await supabaseAdmin.storage.listBuckets();
if (storageError) {
  console.error(`Supabase Storage: FALHA (${storageError.message})`);
  process.exit(1);
}
console.log("Supabase Storage: OK");

if (!process.env.SUPABASE_ANON_KEY) {
  console.error("Variavel ausente: SUPABASE_ANON_KEY");
  process.exit(1);
}
const supabaseAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
const { error: authError } = await supabaseAnon.auth.getSession();
if (authError) {
  console.error(`Supabase Auth: FALHA (${authError.message})`);
  process.exit(1);
}
console.log("Supabase Auth: OK");

