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
    <div className="bos-shell flex min-h-screen flex-col bg-slate-50" data-surface="business-operating-shell">
      <BosHeader
        user={user}
        cliente={cliente}
        empresas={empresas}
        selectedEmpresaId={selectedEmpresaId}
        allowAllEmpresas={allowAllEmpresas}
        onSelectEmpresa={onSelectEmpresa}
        onLogout={onLogout}
      />
      <main className="bos-main flex-1">{children}</main>
    </div>
  );
}

export default BosShell;
