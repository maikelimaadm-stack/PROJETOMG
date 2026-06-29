import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { pathToFileURL } from "node:url";
import { seedClienteModulos } from "../src/modules/clienteModulo/clienteModuloService.js";
import { seedMdpPlatformEntities } from "./seedMdpPlatformEntities.js";
import { seedMdpFields } from "./seedMdpFields.js";
import { seedMdpRelationshipDictionary } from "./seedMdpRelationshipDictionary.js";
import { seedMdpRegistryDictionary } from "./seedMdpRegistryDictionary.js";

dotenv.config();

const CLIENTE_CODIGO = String(process.env.SEED_CLIENTE_CODIGO || "maike").trim().toLowerCase();
const CLIENTE_NOME = String(process.env.SEED_CLIENTE_NOME || "Maike").trim();
const USUARIO_LOGIN = String(process.env.SEED_USUARIO_LOGIN || "maike").trim().toLowerCase();
const USUARIO_SENHA = String(process.env.SEED_USUARIO_SENHA || "123");

export const seedBootstrap = async (prisma = new PrismaClient()) => {
  const senhaHash = await bcrypt.hash(USUARIO_SENHA, 10);

  const cliente = await prisma.cliente.upsert({
    where: { codigo: CLIENTE_CODIGO },
    create: {
      codigo: CLIENTE_CODIGO,
      nome: CLIENTE_NOME,
      status: "Ativo",
      plano: "DEMO",
      ativo: true,
      next_id_global: 1,
    },
    update: {
      nome: CLIENTE_NOME,
      status: "Ativo",
      ativo: true,
    },
  });

  const usuario = await prisma.usuario.upsert({
    where: {
      cliente_id_login: {
        cliente_id: cliente.id,
        login: USUARIO_LOGIN,
      },
    },
    create: {
      cliente_id: cliente.id,
      codigo: 1,
      nome: CLIENTE_NOME,
      login: USUARIO_LOGIN,
      email: `${USUARIO_LOGIN}@local.dev`,
      senha_hash: senhaHash,
      perfil: "ADMIN",
      acesso_global: true,
      ativo: true,
    },
    update: {
      nome: CLIENTE_NOME,
      senha_hash: senhaHash,
      perfil: "ADMIN",
      acesso_global: true,
      ativo: true,
    },
  });

  await seedClienteModulos(prisma);
  await seedMdpPlatformEntities(prisma);
  await seedMdpFields(prisma, { clienteId: cliente.id });
  await seedMdpRelationshipDictionary(prisma);
  await seedMdpRegistryDictionary(prisma);

  return { cliente, usuario };
};

const run = async () => {
  if (String(process.env.SEED_SKIP || "").toLowerCase() === "true") {
    console.log("Seed ignorado (SEED_SKIP=true).");
    return;
  }

  const prisma = new PrismaClient();
  try {
    const { cliente, usuario } = await seedBootstrap(prisma);
    console.log(`Seed OK — cliente "${cliente.codigo}" (${cliente.nome}), usuário "${usuario.login}" (ADMIN, acesso global).`);
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
