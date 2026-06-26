import React, { memo } from "react";
import ModeloBase1CadastroPage from "@/ModeloBase1/render/ModeloBase1CadastroPage.jsx";
import { produtosModeloBase1Config } from "@/modules/produtos/config/produtosModeloBase1Config.js";

/** Cadastro Produtos — certificação ModeloBase1 (config-only). */
function PAGPRO() {
  return <ModeloBase1CadastroPage config={produtosModeloBase1Config} />;
}

export default memo(PAGPRO);
