import React, { memo } from "react";
import ModeloBase1CadastroPage from "@/ModeloBase1/render/ModeloBase1CadastroPage.jsx";
import { buildModeloBase1ConfigFromMakModule } from "@/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js";

/**
 * Alias de compatibilidade — delega ao motor oficial ModeloBase1 (modo server).
 * @deprecated Preferir ModeloBase1CadastroPage com config explícita.
 */
function MakCadastroMotherPage({ module }) {
  if (!module) {
    throw new Error("MakCadastroMotherPage: prop `module` is required");
  }
  const config = buildModeloBase1ConfigFromMakModule(module);
  return <ModeloBase1CadastroPage config={config} />;
}

export default memo(MakCadastroMotherPage);
