/**
 * Factory/validador da configuração declarativa do ModeloBase1.
 * Cada cadastro (Empresas, Clientes, etc.) fornece um config — o motor apenas renderiza.
 *
 * @param {import('./ModeloBase1Config.types.js').ModeloBase1Config} config
 */
export function defineModeloBase1Config(config) {
  if (!config?.makModule) {
    throw new Error("defineModeloBase1Config: `makModule` é obrigatório");
  }
  if (!config?.moduleId) {
    throw new Error("defineModeloBase1Config: `moduleId` é obrigatório");
  }
  if (!config?.components?.FormPanel || !config?.components?.TablePanel || !config?.components?.SearchPanel) {
    throw new Error("defineModeloBase1Config: components FormPanel, TablePanel e SearchPanel são obrigatórios");
  }
  return Object.freeze(config);
}

export default defineModeloBase1Config;
