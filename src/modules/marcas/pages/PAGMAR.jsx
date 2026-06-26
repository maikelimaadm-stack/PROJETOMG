import React, { memo } from "react";
import MakCadastroMotherPage from "@/framework/mak/page/MakCadastroMotherPage.jsx";
import { marcasMakModule } from "@/modules/marcas/config/marcasMakModule.js";

/** Cadastro Marcas — consome a Tela Mãe Visual MAK. */
function PAGMAR() {
  return <MakCadastroMotherPage module={marcasMakModule} />;
}

export default memo(PAGMAR);
