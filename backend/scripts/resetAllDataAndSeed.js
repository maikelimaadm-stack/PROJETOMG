import dotenv from "dotenv";
import { pathToFileURL } from "node:url";
import { ensureSchema } from "./ensureSchema.js";
import { createMigrationPrisma } from "./migrationPrisma.js";
import { seedBootstrap } from "./seedBootstrap.js";
import { seedClienteModulos } from "../src/modules/clienteModulo/clienteModuloService.js";
import { repCps } from "../src/modules/cadcps/repCps.js";

dotenv.config();

const CLIENTE_CODIGO = "maike";
const CLIENTE_NOME = "Maike";
const USUARIO_LOGIN = "maike";
const USUARIO_SENHA = "123";

const TABLES_TO_TRUNCATE = [
  "UsuarioPreferencia",
  "PermissaoEmpresa",
  "RegistroAnexo",
  "registro_global",
  "CadastroRegistro",
  "CadCpsHistorico",
  "CadCpsCampoOpcao",
  "CadCpsCampoEmpresa",
  "CadCpsCampoTela",
  "CadCpsCampo",
  "EntidadeCodigoSequencia",
  "ClienteModulo",
  "AuditLog",
  "Empresa",
  "Usuario",
  "Cliente",
  "CadCpsTela",
];

const resetAllData = async (prisma) => {
  const tableList = TABLES_TO_TRUNCATE.map((t) => `"${t}"`).join(",\n      ");
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      ${tableList}
    RESTART IDENTITY CASCADE;
  `);

  for (const legacy of ["CampoPersonalizado", "EmpresaCodigoSequencia", "CadCpsCodigoSequencia", "ClienteIdGlobalSequencia"]) {
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${legacy}" CASCADE`);
  }
};

export const resetAndSeedMaike = async (prisma) => {
  process.env.SEED_CLIENTE_CODIGO = CLIENTE_CODIGO;
  process.env.SEED_CLIENTE_NOME = CLIENTE_NOME;
  process.env.SEED_USUARIO_LOGIN = USUARIO_LOGIN;
  process.env.SEED_USUARIO_SENHA = USUARIO_SENHA;

  console.log("Garantindo schema ERP...");
  await ensureSchema({ exitOnError: true });

  console.log("Apagando todos os dados do banco...");
  await resetAllData(prisma);

  console.log("Criando cliente e usuário maike...");
  const { cliente, usuario } = await seedBootstrap(prisma);

  console.log("Garantindo módulos do cliente...");
  const modulos = await seedClienteModulos(prisma);
  console.log(`Módulos configurados para ${modulos} cliente(s).`);

  console.log("Garantindo telas CADCPS...");
  await repCps.ensureTelasSeed();

  const { syncAllCodigoSequencias } = await import("../src/modules/sequencias/entidadeCodigoService.js");
  await syncAllCodigoSequencias(prisma);
  console.log("Sequências de código reiniciadas.");

  return { cliente, usuario };
};

const run = async () => {
  const prisma = createMigrationPrisma();
  try {
    const { cliente, usuario } = await resetAndSeedMaike(prisma);
    console.log(
      `OK — Cliente "${cliente.codigo}" (${cliente.nome}), usuário "${usuario.login}" / senha "${USUARIO_SENHA}"`
    );
  } finally {
    await prisma.$disconnect();
  }
};

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  run().catch((error) => {
    console.error("Reset falhou:", error.message);
    process.exit(1);
  });
}
