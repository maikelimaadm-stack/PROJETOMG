import React from "react";

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: String(error?.message || "Falha inesperada na aplicação."),
    };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof console !== "undefined") {
      console.error("[GlobalErrorBoundary]", error, errorInfo);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: "" });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-100 px-4">
          <div className="w-full max-w-lg rounded border border-red-200 bg-white p-6 shadow-sm">
            <h1 className="text-base font-semibold text-red-700">Ocorreu um erro na interface</h1>
            <p className="mt-2 text-sm text-slate-600">
              A aplicação encontrou um erro inesperado. Tente navegar novamente.
            </p>
            <p className="mt-3 rounded bg-slate-50 p-2 text-xs text-slate-500">
              {this.state.message}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                className="h-9 rounded border border-slate-300 px-3 text-sm text-slate-700"
                onClick={() => this.setState({ hasError: false, message: "" })}
              >
                Tentar novamente
              </button>
              <button
                type="button"
                className="h-9 rounded border border-slate-700 bg-slate-700 px-3 text-sm text-white"
                onClick={() => window.location.reload()}
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
