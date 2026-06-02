import React from "react";
import EmpConfiguracaoCamposDialog from "@/framework/cadastro/configurators/EmpConfiguracaoCamposDialog";
import empRepository from "@/modules/empresas/repositories/empRepository";
import { useAuth } from "@/shared/contexts/AuthContext";

export default function PAGCampos() {
  const { empresas } = useAuth();

  return (
    <div className="h-full min-h-0 overflow-hidden bg-white flex flex-col">
      <EmpConfiguracaoCamposDialog
        open
        inline
        onOpenChange={() => {}}
        repository={empRepository}
        empresas={empresas || []}
      />
    </div>
  );
}
