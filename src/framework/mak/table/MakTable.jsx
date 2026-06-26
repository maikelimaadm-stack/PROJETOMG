import React, { memo } from "react";
import MakCadastroTable from "./MakCadastroTable.jsx";

/**
 * Tabela de cadastro MAK — componente principal da Foundation.
 * Requer MakModuleProvider ancestor (ou TBLEMP que injeta o módulo).
 */
function MakTableComponent(props) {
  return <MakCadastroTable {...props} />;
}

const MakTable = memo(MakTableComponent);
MakTable.displayName = "MakTable";

export default MakTable;
