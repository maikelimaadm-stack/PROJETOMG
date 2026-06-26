/**
 * Configuração Empresas para MakCadastroTable.
 * Empresas é consumidor — a tabela pertence à MAK Foundation.
 */
import MakTable from "@/framework/mak/table/MakTable";
import { empresasMakModule } from "@/modules/empresas/config/empresasMakModule";

export default function TBLEMP(props) {
  return <MakTable module={empresasMakModule} {...props} />;
}
