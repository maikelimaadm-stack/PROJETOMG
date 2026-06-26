import React, { memo } from "react";
import MakCadastroPageShell from "@/framework/mak/page/MakCadastroPageShell.jsx";
import { marcasMakModule } from "@/modules/marcas/config/marcasMakModule.js";

function PAGMAR() {
  return <MakCadastroPageShell module={marcasMakModule} />;
}

export default memo(PAGMAR);
