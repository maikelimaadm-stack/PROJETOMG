import { seedMdpPlatformEntities } from "./seedMdpPlatformEntities.js";
import { seedMdpFields } from "./seedMdpFields.js";
import { seedMdpRelationshipDictionary } from "./seedMdpRelationshipDictionary.js";
import { seedMdpRegistryDictionary } from "./seedMdpRegistryDictionary.js";
import { seedMdpPlatformPublish } from "./seedMdpPlatformPublish.js";

export const seedMdpPublishEngine = async (prisma) => {
  await seedMdpPlatformEntities(prisma);
  await seedMdpFields(prisma);
  await seedMdpRelationshipDictionary(prisma);
  await seedMdpRegistryDictionary(prisma);
  const publish = await seedMdpPlatformPublish(prisma);
  return { publish };
};
