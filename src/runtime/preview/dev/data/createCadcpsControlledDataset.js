import { createControlledModuleDataset } from './controlledDevDataset.js';

/**
 * Controlled, SAFE, deterministic cadcps dev dataset. Uses only fictitious
 * example field records — never real data, no DB/backend/Prisma/fetch.
 * Includes one valid record, one invalid (missing required nome/tipo), and one
 * with a permission-denied field (`ativo`).
 *
 * @returns {import('../../../types/controlled-dev-dataset.js').ControlledModuleDataset}
 */
export function createCadcpsControlledDataset() {
  return createControlledModuleDataset({
    moduleId: 'cadcps',
    columns: ['codigo', 'nome', 'tipo', 'telas', 'obrigatorio', 'ativo'],
    requiredFields: ['nome', 'tipo'],
    metadata: { source: 'controlled-dev-dataset', mocked: true, module: 'cadcps' },
    records: [
      {
        id: 'cps-1',
        deniedFields: [],
        values: { codigo: 'C001', nome: 'CAMPO EXEMPLO', tipo: 'text', telas: 'empresas', obrigatorio: 'Sim', ativo: 'Sim' },
      },
      {
        id: 'cps-2',
        deniedFields: [],
        values: { codigo: 'C002', nome: '', tipo: '', telas: 'cadcps', obrigatorio: 'Não', ativo: 'Sim' }, // invalid — missing nome/tipo
      },
      {
        id: 'cps-3',
        deniedFields: ['ativo'], // permission-denied field for visual testing
        values: { codigo: 'C003', nome: 'CAMPO NEGADO', tipo: 'select', telas: 'empresas', obrigatorio: 'Não', ativo: 'Sim' },
      },
    ],
  });
}
