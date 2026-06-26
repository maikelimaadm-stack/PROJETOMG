/**
 * Configuração Empresas para MakCadastroForm.
 * Empresas é consumidor — o formulário pertence à MAK Foundation.
 */
import MakFormShell from "@/framework/mak/form/MakFormShell";
import { empresasMakModule } from "@/modules/empresas/config/empresasMakModule";
import { MakModuleProvider } from "@/framework/mak/runtime";

export default function FORMEMP(props) {
  return (
    <MakModuleProvider module={empresasMakModule}>
      <MakFormShell {...props} />
    </MakModuleProvider>
  );
}
