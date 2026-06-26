import React, { memo } from "react";
import TBLEMP from "@/modules/empresas/components/TBLEMP";

/**
 * Adaptador MAK para tabela de cadastro.
 * Hoje delega a TBLEMP (Empresas); futuros módulos injetam renderer via props.
 */
function MakTableComponent(props) {
  return <TBLEMP {...props} />;
}

const MakTable = memo(MakTableComponent);
MakTable.displayName = "MakTable";

export default MakTable;
