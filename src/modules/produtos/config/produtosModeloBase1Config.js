import { buildModeloBase1ConfigFromMakModule } from "@/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js";
import { produtosMakModule } from "@/modules/produtos/config/produtosMakModule.js";

export const produtosModeloBase1Config = buildModeloBase1ConfigFromMakModule(produtosMakModule);

export default produtosModeloBase1Config;
