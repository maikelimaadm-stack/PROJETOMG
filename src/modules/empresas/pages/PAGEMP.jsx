import React, { memo } from "react";
import ModeloBase1CadastroPage from "@/ModeloBase1/render/ModeloBase1CadastroPage.jsx";
import { empresasModeloBase1Config } from "@/modules/empresas/config/modeloBase1/empresasModeloBase1Config.js";

/**
 * Cadastro de Empresas — implementação do ModeloBase1.
 * Esta página contém apenas a configuração; o motor está em ModeloBase1.
 */
function PAGEMP() {
  return <ModeloBase1CadastroPage config={empresasModeloBase1Config} />;
}

export default memo(PAGEMP);
