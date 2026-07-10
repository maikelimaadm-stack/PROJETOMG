import { createControlledModuleDataset } from './controlledDevDataset.js';

/**
 * Controlled, SAFE, deterministic Empresas dev dataset. Uses only clearly
 * fictitious example companies — never real company data, no DB/backend/
 * Prisma/fetch. Includes one valid record, one with a missing required field,
 * and one with a permission-denied field. The `apiKey` value is masked.
 *
 * @returns {import('../../../types/controlled-dev-dataset.js').ControlledModuleDataset}
 */
export function createEmpresasControlledDataset() {
  return createControlledModuleDataset({
    moduleId: 'empresas',
    columns: ['razao_social', 'nome_fantasia', 'cnpj', 'cidade', 'uf', 'ativo'],
    requiredFields: ['razao_social'],
    metadata: { source: 'controlled-dev-dataset', mocked: true, module: 'empresas' },
    records: [
      {
        id: 'emp-1',
        deniedFields: [],
        values: {
          razao_social: 'FAZENDA MODELO ALFA',
          nome_fantasia: 'Alfa',
          cnpj: '00.000.000/0001-00',
          inscricao_estadual: 'ISENTO',
          cidade: 'Cidade Exemplo',
          uf: 'GO',
          ativo: 'Sim',
          observacao: 'registro de exemplo controlado',
          apiKey: 'EXAMPLE-SECRET-SHOULD-BE-MASKED',
        },
      },
      {
        id: 'emp-2',
        deniedFields: [],
        values: {
          razao_social: '', // missing required — invalid record for controlled testing
          nome_fantasia: 'Norte',
          cnpj: '00.000.000/0002-00',
          inscricao_estadual: '',
          cidade: 'Agro Demo Norte',
          uf: 'MT',
          ativo: 'Sim',
          observacao: 'registro sem razão social',
          apiKey: 'EXAMPLE-SECRET-2',
        },
      },
      {
        id: 'emp-3',
        deniedFields: ['inscricao_estadual'], // permission-denied field for visual testing
        values: {
          razao_social: 'PECUÁRIA EXEMPLO SUL',
          nome_fantasia: 'Sul',
          cnpj: '00.000.000/0003-00',
          inscricao_estadual: '123456789',
          cidade: 'Cidade Exemplo Sul',
          uf: 'RS',
          ativo: 'Não',
          observacao: 'registro com campo fiscal negado',
          apiKey: 'EXAMPLE-SECRET-3',
        },
      },
    ],
  });
}
