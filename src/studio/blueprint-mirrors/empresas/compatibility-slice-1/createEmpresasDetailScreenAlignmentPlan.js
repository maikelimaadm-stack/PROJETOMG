import { safeCloneGenericModel } from '../../../../runtime/generic-model/index.js';
import { compatDigest } from './empresasStudioCompatibilitySlice1Config.js';

/**
 * Plan for aligning the missing Empresas detail screen. Pure, contract-only. Does NOT
 * create a detail screen, change PAGEMP, or change ModeloBase1CadastroPage. The
 * preferred lowest-risk path is deriving a read-only detail from the existing form.
 *
 * @param {Object} [options]
 * @returns {Object} detail screen alignment plan
 */
export function createEmpresasDetailScreenAlignmentPlan(options = {}) {
  void options;
  const body = {
    kind: 'empresas-detail-screen-alignment-plan',
    currentDetailScreenStatus: 'derive_from_form_readonly',
    hasDedicatedDetailScreen: false,
    detailFromFormPossible: true,
    detailReadOnlyModePossible: true,
    requiredFieldsForDetail: ['codempresa', 'razao_social', 'nome_fantasia', 'tipo_pessoa', 'cpf_cnpj', 'cidade', 'estado', 'status'],
    requiredPermissions: ['read'],
    requiredStates: ['emptyState', 'loadingState', 'errorState'],
    risks: ['creating a new detail screen prematurely adds UI risk', 'must not touch PAGEMP / ModeloBase1CadastroPage'],
    classification: 'derive_from_form_readonly',
    createsDetailScreenNow: false,
    changesPagemp: false,
    changesModeloBase1CadastroPage: false,
    recommendedFutureSlice: 'EMPRESAS STUDIO COMPATIBILITY SLICE 2',
    alignmentStatus: 'planned',
  };
  return safeCloneGenericModel({ ...body, detailPlanDigest: compatDigest({ classification: body.classification, requiredFields: body.requiredFieldsForDetail }) });
}

export default createEmpresasDetailScreenAlignmentPlan;
