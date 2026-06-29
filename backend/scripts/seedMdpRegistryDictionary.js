import { seedMdpRegistrySchemas } from "./seedMdpRegistrySchemas.js";
import { seedMdpRegistry } from "./seedMdpRegistry.js";

export const seedMdpRegistryDictionary = async (prisma) => {
  const schemas = await seedMdpRegistrySchemas(prisma);
  const entries = await seedMdpRegistry(prisma);
  return { schemas, entries };
};
