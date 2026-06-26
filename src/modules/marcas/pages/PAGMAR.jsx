import React, { memo } from "react";
import ModeloBase1CadastroPage from "@/ModeloBase1/render/ModeloBase1CadastroPage.jsx";
import { marcasModeloBase1Config } from "@/modules/marcas/config/marcasModeloBase1Config.js";

/** Cadastro Marcas — consumidor ModeloBase1 (config-only). */
function PAGMAR() {
  return <ModeloBase1CadastroPage config={marcasModeloBase1Config} />;
}

export default memo(PAGMAR);
