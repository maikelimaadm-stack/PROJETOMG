import { createCadcpsTableFormShadow } from '../../shadow/pilots/secondModuleShadowPilot.js';
import { createPreviewModel } from '../previewModel.js';

/**
 * Builds a deterministic, SAFE preview model for the second pilot module
 * (cadcps), through the SAME generic pipeline used for Empresas — proving the
 * pipeline is reusable. Uses only the static descriptor (never real data, no
 * DB/backend/Prisma/fetch). A denying permission engine marks the permissioned
 * field as denied so the diagnostics carry a `deniedFields` entry.
 *
 * @returns {Promise<import('../../types/preview.js').PreviewModel>}
 */
export async function createSecondModuleDevPreviewFixture() {
  const shadow = createCadcpsTableFormShadow({
    enabled: true,
    // Deterministic, side-effect-free permission stub — denies the fiscal-like managed field.
    permissionEngine: { can: async (_action, resource) => resource !== 'cadcps.manage' },
  });
  const report = await shadow.run();
  return createPreviewModel(report.runtimeProjection, { differences: report.comparison.differences });
}

/** Generic alias. */
export const createCadcpsDevPreviewFixture = createSecondModuleDevPreviewFixture;
