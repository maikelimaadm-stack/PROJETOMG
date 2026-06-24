import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { pathToFileURL } from "node:url";

dotenv.config();

const CLIENTE_CODIGO = String(process.env.SEED_CLIENTE_CODIGO || "maike").trim().toLowerCase();
const USUARIO_SENHA = String(process.env.SEED_USUARIO_SENHA || "123");
const EXTRA_LOGINS = ["mak1", "mak2", "mak3", "mak4", "mak5"];

export const seedMaikeExtraUsers = async (prisma = new PrismaClient()) => {
  const cliente = await prisma.cliente.findFirst({
    where: { codigo: { equals: CLIENTE_CODIGO, mode: "insensitive" } },
    select: { id: true, codigo: true, nome: true },
  });

  if (!cliente) {
    throw new Error(`Cliente "${CLIENTE_CODIGO}" não encontrado.`);
  }

  const senhaHash = await bcrypt.hash(USUARIO_SENHA, 10);
  const maxCodigoRow = await prisma.usuario.aggregate({
    where: { cliente_id: cliente.id },
    _max: { codigo: true },
  });
  let nextCodigo = Number(maxCodigoRow._max.codigo || 0) + 1;

  const created = [];

  for (const login of EXTRA_LOGINS) {
    const label = login.toUpperCase();
    const existing = await prisma.usuario.findFirst({
      where: { cliente_id: cliente.id, login },
      select: { id: true, codigo: true },
    });
    const codigo = existing?.codigo ?? nextCodigo++;

    const usuario = await prisma.usuario.upsert({
      where: {
        cliente_id_login: {
          cliente_id: cliente.id,
          login,
        },
      },
      create: {
        cliente_id: cliente.id,
        codigo,
        nome: label,
        login,
        email: `${login}@local.dev`,
        senha_hash: senhaHash,
        perfil: "OPERADOR",
        acesso_global: true,
        ativo: true,
      },
      update: {
        nome: label,
        senha_hash: senhaHash,
        perfil: "OPERADOR",
        acesso_global: true,
        ativo: true,
      },
    });

    created.push(usuario);
  }

  return { cliente, usuarios: created };
};

const run = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL ausente. Configure backend/.env antes de executar este seed.");
  }

  const prisma = new PrismaClient();
  try {
    const { cliente, usuarios } = await seedMaikeExtraUsers(prisma);
    console.log(`Seed OK — cliente "${cliente.codigo}" (${cliente.nome})`);
    for (const usuario of usuarios) {
      console.log(`  • ${usuario.login} / senha "${USUARIO_SENHA}" (${usuario.perfil}, acesso global)`);
    }
  } finally {
    await prisma.$disconnect();
  }
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  run().catch((error) => {
    console.error(`Seed falhou: ${error.message}`);
    process.exit(1);
  });
}
