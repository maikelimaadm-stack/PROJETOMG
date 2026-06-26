import React, { memo } from "react";
import MakCadastroTable from "./MakCadastroTable.jsx";

/**
 * Tabela de cadastro MAK — componente principal da Foundation.
 * Módulos consomem via config (ex.: TBLEMP re-export) ou diretamente com props.
 */
function MakTableComponent(props) {
  return <MakCadastroTable {...props} />;
}

const MakTable = memo(MakTableComponent);
MakTable.displayName = "MakTable";

export default MakTable;
