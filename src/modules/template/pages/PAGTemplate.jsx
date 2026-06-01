import React from "react";
import SankhyaListToolbar from "@/framework/cadastro/toolbars/EmpListToolbar";

export default function PAGTemplate() {
  return (
    <div className="h-full min-h-0 overflow-hidden bg-white">
      <SankhyaListToolbar
        viewMode="table"
        total={0}
        currentIndex={0}
        searchValue=""
        onSearchChange={() => {}}
        onNew={() => {}}
        onToggleView={() => {}}
        filterActive={false}
        title="Template de Cadastro"
        recordLabel=""
      />
    </div>
  );
}

