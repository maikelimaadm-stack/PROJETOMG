import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const CLIENTE_CODIGO = "maike";
const CLIENTE_NOME = "Maike";
const USUARIO_LOGIN = "maike";
const USUARIO_SENHA = "123";

const resetAllData = async (prisma) => {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "UsuarioPreferencia",
      "PermissaoEmpresa",
      "RegistroAnexo",
      "CadastroRegistro",
      "CadCpsHistorico",
      "CadCpsCampoOpcao",
      "CadCpsCampoEmpresa",
      "CadCpsCampoTela",
      "CadCpsCampo",
      "CampoPersonalizado",
      "AuditLog",
      "EmpresaCodigoSequencia",
      "CadCpsCodigoSequencia",
      "Empresa",
      "Usuario",
      "Cliente",
      "CadCpsTela"
    RESTART IDENTITY CASCADE;
  `);
};

const seedMaike = async (prisma) => {
  const senhaHash = await bcrypt.hash(USUARIO_SENHA, 10);
  const cliente = await prisma.cliente.create({
    data: {
      codigo: CLIENTE_CODIGO,
      nome: CLIENTE_NOME,
      ativo: true,
    },
  });
  const usuario = await prisma.usuario.create({
    data: {
      cliente_id: cliente.id,
      login: USUARIO_LOGIN,
      senha_hash: senhaHash,
      perfil: "ADMIN",
      acesso_global: true,
      ativo: true,
    },
  });
  return { cliente, usuario };
};

const run = async () => {
  const prisma = new PrismaClient();
  try {
    console.log("Apagando todos os dados do banco...");
    await resetAllData(prisma);
    console.log("Criando cliente e usuário...");
    const { cliente, usuario } = await seedMaike(prisma);
    console.log(`OK — Cliente "${cliente.codigo}" (${cliente.nome}), usuário "${usuario.login}" / senha "${USUARIO_SENHA}"`);
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("Reset falhou:", error.message);
  process.exit(1);
});
