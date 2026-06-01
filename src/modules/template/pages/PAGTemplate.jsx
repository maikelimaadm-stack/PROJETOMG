import React, { useState } from "react";
import SankhyaListToolbar from "@/framework/cadastro/toolbars/EmpListToolbar";
import RegistroAnexosDialog from "@/framework/cadastro/attachments/RegistroAnexosDialog";
import EmpConfiguracaoCamposDialog from "@/framework/cadastro/configurators/EmpConfiguracaoCamposDialog";
import EmpConfiguracaoExportacaoDialog from "@/framework/cadastro/configurators/EmpConfiguracaoExportacaoDialog";
import FORMTemplate from "@/modules/template/components/FORMTemplate";
import TBLTemplate from "@/modules/template/components/TBLTemplate";
import templateRepository from "@/modules/template/repositories/templateRepository";

export default function PAGTemplate() {
  const [showForm, setShowForm] = useState(false);
  const [showConfigCampos, setShowConfigCampos] = useState(false);
  const [showConfigPdf, setShowConfigPdf] = useState(false);
  const [showConfigExcel, setShowConfigExcel] = useState(false);
  const [showAnexos, setShowAnexos] = useState(false);

  return (
    <div className="h-full min-h-0 overflow-hidden bg-white">
      {showForm ? (
        <FORMTemplate onSubmit={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      ) : (
        <>
          <SankhyaListToolbar
            viewMode="table"
            total={0}
            currentIndex={0}
            searchValue=""
            onSearchChange={() => {}}
            onNew={() => setShowForm(true)}
            onToggleView={() => setShowForm(true)}
            filterActive={false}
            onConfigColumns={() => setShowConfigCampos(true)}
            onConfigExportPdf={() => setShowConfigPdf(true)}
            onConfigExportExcel={() => setShowConfigExcel(true)}
            onAttachClick={() => setShowAnexos(true)}
            title="Template de Cadastro"
            recordLabel=""
          />
          <TBLTemplate />
        </>
      )}

      <EmpConfiguracaoCamposDialog open={showConfigCampos} onOpenChange={setShowConfigCampos} repository={templateRepository} />
      <EmpConfiguracaoExportacaoDialog open={showConfigPdf} onOpenChange={setShowConfigPdf} columns={[]} initialConfig={{ useConfiguredColumns: false, columnIds: [] }} tipo="pdf" onSaveConfig={() => {}} />
      <EmpConfiguracaoExportacaoDialog open={showConfigExcel} onOpenChange={setShowConfigExcel} columns={[]} initialConfig={{ useConfiguredColumns: false, columnIds: [] }} tipo="excel" onSaveConfig={() => {}} />
      <RegistroAnexosDialog open={showAnexos} onOpenChange={setShowAnexos} entityName="TemplateCadastro" recordId="template-record" title="Template" />
    </div>
  );
}

