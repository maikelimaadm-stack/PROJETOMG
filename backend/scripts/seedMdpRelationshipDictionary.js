import { seedMdpRelationships } from "./seedMdpRelationships.js";
import { bindMdpFieldRelationshipRefs } from "./bindMdpFieldRelationshipRefs.js";

export const seedMdpRelationshipDictionary = async (prisma) => {
  const relationships = await seedMdpRelationships(prisma);
  const bindings = await bindMdpFieldRelationshipRefs(prisma);
  return { relationships, bindings };
};
