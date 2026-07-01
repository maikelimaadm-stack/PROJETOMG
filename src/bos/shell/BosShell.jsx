import BosHeader from "@/bos/shell/BosHeader";
import "@/bos/styles/bos.css";

export function BosShell({
  children,
  user,
  cliente,
  empresas,
  selectedEmpresaId,
  allowAllEmpresas,
  onSelectEmpresa,
  onLogout,
}) {
  return (
    <div
      className="bos-shell flex h-screen max-h-screen flex-col overflow-hidden bg-slate-50"
      data-surface="business-operating-shell"
    >
      <BosHeader
        user={user}
        cliente={cliente}
        empresas={empresas}
        selectedEmpresaId={selectedEmpresaId}
        allowAllEmpresas={allowAllEmpresas}
        onSelectEmpresa={onSelectEmpresa}
        onLogout={onLogout}
      />
      <main className="bos-main erp-scrollbar min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

export default BosShell;
