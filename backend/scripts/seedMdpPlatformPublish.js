import { MDP_PLATFORM_VERSION_ID } from "../src/modules/mdp/mdpEntityConstants.js";
import { mdpPublishService } from "../src/modules/mdp/mdpPublishService.js";
import { mdpPublishRepository } from "../src/modules/mdp/mdpPublishRepository.js";

const SYSTEM_SCOPE = {
  clienteId: "platform",
  userId: "system",
  perfil: "ADMIN",
};

export const seedMdpPlatformPublish = async (_prisma) => {
  const existing = await mdpPublishRepository.findBundle({
    versionId: MDP_PLATFORM_VERSION_ID,
    moduleId: "empresas",
    baseTemplateId: "modelobase1",
  });
  if (existing) {
    return { skipped: true, bundleId: existing.bundle_id };
  }

  const result = await mdpPublishService.publish(
    {
      moduleId: "empresas",
      versionId: MDP_PLATFORM_VERSION_ID,
      semver: "1.0.0",
      scope: "platform",
      changelog: "MDP-5 platform publish — empresas pilot",
      pinEnvironments: ["development", "qa", "production"],
      snapshotType: "environment",
    },
    SYSTEM_SCOPE
  );

  return result;
};
