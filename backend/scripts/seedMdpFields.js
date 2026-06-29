import { seedMdpNativeFields } from "./seedMdpNativeFields.js";
import { migrateCadcpsToMdpFields } from "./migrateCadcpsToMdpFields.js";

export const seedMdpFields = async (prisma, { clienteId } = {}) => {
  const native = await seedMdpNativeFields(prisma);
  const migration = await migrateCadcpsToMdpFields(prisma, { clienteId });
  return { native, migration };
};
