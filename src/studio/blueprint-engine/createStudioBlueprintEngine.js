import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import {
  STUDIO_BLUEPRINT_ENGINE_NAME,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_ENGINE_MODE,
  STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
  STUDIO_BLUEPRINT_HARDENING_VERSION,
  EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
  STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES,
} from './studioBlueprintEngineConfig.js';
import { createEmpresasCertifiedBlueprintMirror } from '../blueprint-mirrors/empresas/index.js';
import { createStudioDraftBlueprint } from './createStudioDraftBlueprint.js';
import { normalizeStudioBlueprint } from './normalizeStudioBlueprint.js';
import { validateStudioBlueprint } from './validateStudioBlueprint.js';
import { validateStudioBlueprintSafety } from './validateStudioBlueprintSafety.js';
import { validateStudioBlueprintAgainstHardening } from './validateStudioBlueprintAgainstHardening.js';
import { createStudioBlueprintManifest } from './createStudioBlueprintManifest.js';
import { verifyStudioBlueprintEngineManifest } from './verifyStudioBlueprintEngineManifest.js';
import { checkStudioBlueprintEngineCompatibility } from './checkStudioBlueprintEngineCompatibility.js';
import { createStudioBlueprintDiagnostics } from './createStudioBlueprintDiagnostics.js';
import { createStudioHeadlessPreviewMetadata } from './createStudioHeadlessPreviewMetadata.js';
import { createStudioBlueprintEngineReadiness } from './createStudioBlueprintEngineReadiness.js';
import { createStudioBlueprintEngineNextDecision } from './createStudioBlueprintEngineNextDecision.js';

/**
 * Reference to the certified Empresas mirror, consumed READ-ONLY. The engine never
 * rewrites Empresas; it only records the mirror's identity and digest as a seed
 * reference for future blueprints.
 * @returns {Object}
 */
function buildEmpresasReference() {
  let mirrorVersion = EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION;
  let overallDigest = null;
  let safe = false;
  try {
    const mirror = createEmpresasCertifiedBlueprintMirror();
    mirrorVersion = mirror.mirrorVersion ?? mirrorVersion;
    overallDigest = mirror?.manifest?.overallDigest ?? null;
    safe = mirror.safeToUseAsMirrorReference === true;
  } catch {
    safe = false;
  }
  return {
    kind: 'studio-blueprint-engine-empresas-reference',
    mirrorVersion,
    overallDigest,
    referenceOnly: true,
    rewriteEmpresas: false,
    safeToUseAsSeed: safe,
  };
}

/**
 * Root composer for the STUDIO BLUEPRINT ENGINE FOUNDATION. Given a draft blueprint
 * description, runs the full headless pipeline: draft → normalize → validate →
 * safety → hardening → manifest → verify → preview metadata → readiness → next
 * decision. Optionally compares against a `previous` normalized blueprint. Pure,
 * headless, contract-only. Never renders UI, registers a route/menu/module, touches
 * backend/Prisma/migration/network/production/staging, mutates, persists, generates a
 * module, or rewrites Empresas.
 *
 * @param {Object} [options]
 * @param {Object} [options.blueprint] draft description (fields/screens/permissions...)
 * @param {Object} [options.previous] a previous normalized blueprint to compare against
 * @returns {Object} the full engine run package
 */
export function createStudioBlueprintEngine(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const draft = createStudioDraftBlueprint(isGenericModelPlainObject(o.blueprint) ? o.blueprint : {});
  const normalized = normalizeStudioBlueprint(draft);
  const validation = validateStudioBlueprint(normalized);
  const safety = validateStudioBlueprintSafety(normalized);
  const hardening = validateStudioBlueprintAgainstHardening(normalized);

  const blockers = [];
  if (validation.valid === false) blockers.push('structural invalid');
  if (safety.safe === false) blockers.push('safety violation');
  if (hardening.passed === false) blockers.push('hardening violation');
  const warnings = [...(Array.isArray(validation.warnings) ? validation.warnings : [])];

  const manifest = createStudioBlueprintManifest({ draft, normalized, validation, safety, hardening, blockers, warnings });
  const verification = verifyStudioBlueprintEngineManifest({ manifest });

  const previewMetadata = createStudioHeadlessPreviewMetadata(normalized);

  const compatibility = isGenericModelPlainObject(o.previous)
    ? checkStudioBlueprintEngineCompatibility({ current: o.previous, next: normalized })
    : null;

  const readiness = createStudioBlueprintEngineReadiness({ validation, safety, hardening, verification });
  const nextDecision = createStudioBlueprintEngineNextDecision({ readiness, compatibility: compatibility ?? {} });

  const diagnostics = createStudioBlueprintDiagnostics({
    normalizeStatus: 'normalized',
    validationStatus: validation.valid ? 'valid' : 'invalid',
    safetyStatus: safety.safe ? 'safe' : 'violation',
    hardeningStatus: hardening.passed ? 'passed' : 'violation',
    manifestStatus: manifest.readiness,
    verifierStatus: verification.valid ? 'valid' : 'invalid',
    compatibilityStatus: compatibility ? compatibility.classification : 'not_applicable',
    blockers,
    warnings,
  });

  const empresasReference = buildEmpresasReference();
  const engineReadiness = blockers.length === 0 ? 'blueprint_engine_foundation_ready' : 'blocked';

  return safeCloneGenericModel({
    kind: 'studio-blueprint-engine',
    engineName: STUDIO_BLUEPRINT_ENGINE_NAME,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    mode: STUDIO_BLUEPRINT_ENGINE_MODE,
    certificationVersion: STUDIO_BLUEPRINT_CONTRACT_CERTIFICATION_VERSION,
    hardeningVersion: STUDIO_BLUEPRINT_HARDENING_VERSION,
    empresasMirrorVersion: EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION,
    moduleId: normalized.moduleId,
    modelType: normalized.modelType,
    modelFamily: normalized.modelFamily,
    ...STUDIO_BLUEPRINT_ENGINE_HEADLESS_CAPABILITIES,
    draft,
    normalized,
    validation,
    safety,
    hardening,
    manifest,
    verification,
    previewMetadata,
    compatibility,
    diagnostics,
    empresasReference,
    readinessReport: readiness,
    nextDecision,
    blockers,
    warnings,
    readiness: engineReadiness,
    overallDigest: manifest.overallDigest,
    safeToUseAsEngineOutput: verification.safeToUseAsEngineOutput,
    nextAllowedStage: nextDecision.recommendedNextSlice,
  });
}

export default createStudioBlueprintEngine;
