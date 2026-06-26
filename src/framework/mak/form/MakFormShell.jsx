import React, { memo } from "react";
import MakCadastroForm from "./MakCadastroForm.jsx";

class MakFormErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[MakFormShell] Falha ao renderizar formulário", error, info);
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

/**
 * Shell de formulário MAK — componente principal da Foundation.
 * Aceita FormComponent opcional para módulos futuros; default: MakCadastroForm.
 */
function MakFormShellComponent({ formKey, FormComponent = MakCadastroForm, ...formProps }) {
  const Renderer = FormComponent;
  return (
    <div className="emp-form-panel flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <MakFormErrorBoundary key={formKey}>
        <Renderer {...formProps} />
      </MakFormErrorBoundary>
    </div>
  );
}

const MakFormShell = memo(MakFormShellComponent);
MakFormShell.displayName = "MakFormShell";

export default MakFormShell;
