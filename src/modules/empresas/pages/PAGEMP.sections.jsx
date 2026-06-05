import React from "react";
import SankhyaListToolbar from "@/framework/cadastro/toolbars/EmpListToolbar";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";
import FORMEMP from "@/modules/empresas/components/FORMEMP";
import TBLEMP from "@/modules/empresas/components/TBLEMP";
import EmpConfiguracaoExportacaoDialog from "@/framework/cadastro/configurators/EmpConfiguracaoExportacaoDialog";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import RegistroAnexosDialog from "@/framework/cadastro/attachments/RegistroAnexosDialog";

class EmpresasFormErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[EmpresasFormPanel] Falha ao renderizar formulário", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-slate-800">Não foi possível abrir o formulário.</p>
          <p className="max-w-md text-xs text-slate-600">
            O layout salvo pode estar inconsistente. Tente recarregar a página ou redefinir o layout em
            Configuração de layout.
          </p>
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            onClick={() => this.setState({ error: null })}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const EmpresasFormPanel = ({ showForm, formProps }) => {
  if (!showForm) return null;
  return (
    <div className="relative z-10 flex h-full min-h-0 w-full flex-1 overflow-hidden">
      <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        <EmpresasFormErrorBoundary key={formProps.key}>
          <FORMEMP {...formProps} />
        </EmpresasFormErrorBoundary>
      </div>
    </div>
  );
};

export const EmpresasTablePanel = ({
  hidden,
  toolbarProps,
  tableProps,
}) => (
  <EmpSplitToolbarLayout
    className={hidden ? "hidden" : "emp-table-view flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden"}
    contentClassName="emp-table-card"
    toolbar={<SankhyaListToolbar {...toolbarProps} />}
  >
    <div className="emp-table-panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <TBLEMP {...tableProps} />
    </div>
  </EmpSplitToolbarLayout>
);

export const EmpresasDialogs = ({
  exportPdfProps,
  exportExcelProps,
  anexosProps,
  confirmDeleteProps,
}) => (
  <>
    <EmpConfiguracaoExportacaoDialog {...exportPdfProps} />
    <EmpConfiguracaoExportacaoDialog {...exportExcelProps} />
    <RegistroAnexosDialog {...anexosProps} />
    <ConfirmDialog {...confirmDeleteProps} />
  </>
);
