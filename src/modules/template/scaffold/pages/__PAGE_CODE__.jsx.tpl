import React, { memo } from "react";
import ModeloBase1CadastroPage from "@/ModeloBase1/render/ModeloBase1CadastroPage.jsx";
import { __MODULE_ID__ModeloBase1Config } from "@/modules/__MODULE_ID__/config/__MODULE_ID__ModeloBase1Config.js";

/** Cadastro __PLURAL_LABEL__ — certificação ModeloBase1 (config-only). */
function __PAGE_CODE__() {
  return <ModeloBase1CadastroPage config={__MODULE_ID__ModeloBase1Config} />;
}

export default memo(__PAGE_CODE__);
