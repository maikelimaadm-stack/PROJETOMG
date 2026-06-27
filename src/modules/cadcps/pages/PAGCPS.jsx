import React, { memo } from "react";
import ModeloBase1CadastroPage from "@/ModeloBase1/render/ModeloBase1CadastroPage.jsx";
import { cadcpsModeloBase1Config } from "@/modules/cadcps/config/cadcpsModeloBase1Config.js";

/** Cadastro Campos Personalizados — consumidor ModeloBase1 (config-only). */
function PAGCPS() {
  return <ModeloBase1CadastroPage config={cadcpsModeloBase1Config} />;
}

export default memo(PAGCPS);
