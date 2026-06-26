import { MgEmpresasChromeProvider } from "./MgEmpresasChromeContext";
import MgEmpresasShell from "./MgEmpresasShell";

export default function MgEmpresasLayoutRoute() {
  return (
    <MgEmpresasChromeProvider>
      <MgEmpresasShell />
    </MgEmpresasChromeProvider>
  );
}
