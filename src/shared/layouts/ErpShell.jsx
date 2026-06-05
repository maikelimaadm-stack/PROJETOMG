import React from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/shared/ui/sidebar";
import ErpSidebarNav from "@/shared/layouts/ErpSidebarNav";
import { ErpPageHeaderProvider, useErpPageHeader } from "@/shared/layouts/ErpPageHeaderContext";
import {
  ErpTableFullscreenProvider,
  useErpTableFullscreen,
} from "@/shared/layouts/ErpTableFullscreenContext";
import { EmpFullscreenEnterIcon } from "@/framework/cadastro/pagination/EmpTableFullscreenIcon";
import { buildErpBreadcrumbs } from "@/shared/navigation/erpMenuConfig";
import ErpRecordMeta from "@/shared/layouts/ErpRecordMeta";

const AUTHORIZED_SCOPE_OPTION = "__AUTHORIZED_SCOPE__";

const resolveCompanySelectorValue = (selectedEmpresaId, allowAllEmpresas) => {
  if (selectedEmpresaId === "all") return "all";
  const normalizedId =
    selectedEmpresaId != null ? String(selectedEmpresaId).trim() : "";
  if (normalizedId) return normalizedId;
  return allowAllEmpresas ? "all" : AUTHORIZED_SCOPE_OPTION;
};

function ErpBrand() {
  return (
    <div className="erp-sidebar-brand flex items-center gap-3 px-3 py-4">
      <div className="erp-sidebar-logo flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#2899f5] text-sm font-bold text-white">
        M
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-800">MAK Gestão ERP</div>
        <div className="truncate text-xs text-slate-500">Sistema de gestão</div>
      </div>
    </div>
  );
}

function ErpTopHeader({
  empresas,
  selectedEmpresaId,
  onSelectEmpresa,
  allowAllEmpresas,
  onLogout,
}) {
  const { visible: tableFullscreenVisible, isFullscreen, onToggle: onToggleTableFullscreen } =
    useErpTableFullscreen();
  const selectorValue = resolveCompanySelectorValue(selectedEmpresaId, allowAllEmpresas);

  return (
    <header className="erp-shell-header flex h-10 shrink-0 items-center justify-between gap-2 bg-white px-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="erp-shell-trigger h-8 w-8 rounded-[5px] border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-600">Empresa:</label>
        <select
          value={selectorValue}
          onChange={(event) => onSelectEmpresa(event.target.value)}
          className="erp-shell-company-select erp-select-closed h-8 min-w-[220px] max-w-[320px] rounded-md border border-slate-300 bg-white px-2 pr-7 text-xs text-slate-700"
          title="Escolha ver todas as empresas ou focar em uma só"
        >
          <optgroup label="Visão geral">
            {allowAllEmpresas ? <option value="all">Todas as empresas</option> : null}
            {!allowAllEmpresas ? (
              <option value={AUTHORIZED_SCOPE_OPTION}>Todas as empresas autorizadas</option>
            ) : null}
          </optgroup>
          {empresas.length > 0 ? (
            <optgroup label="Uma empresa">
              {empresas.map((empresa) => (
                <option key={String(empresa.id)} value={String(empresa.id)}>
                  {empresa.codempresa} - {empresa.nome_empresa}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
      </div>

      <div className="flex items-center gap-2">
        {tableFullscreenVisible && onToggleTableFullscreen ? (
          <button
            type="button"
            onClick={onToggleTableFullscreen}
            className="erp-shell-table-fullscreen inline-flex h-8 w-8 items-center justify-center rounded-[5px] border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            title={isFullscreen ? "Sair da tabela cheia" : "Visualizar tabela cheia"}
            aria-label={isFullscreen ? "Sair da tabela cheia" : "Visualizar tabela cheia"}
            aria-pressed={isFullscreen}
          >
            {isFullscreen ? (
              <X className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            ) : (
              <EmpFullscreenEnterIcon className="h-3.5 w-3.5 shrink-0" />
            )}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onLogout}
          className="erp-shell-logout h-8 rounded-[5px] border border-slate-300 bg-white px-3 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-800"
        >
          Sair
        </button>
      </div>
    </header>
  );
}

function ErpBreadcrumbs({ pathname }) {
  const { header } = useErpPageHeader();
  const crumbs = buildErpBreadcrumbs(pathname);
  const trail = [...crumbs];

  if (header.recordMeta) {
    trail.push({
      label: (
        <ErpRecordMeta codigo={header.recordMeta.codigo} nome={header.recordMeta.nome} />
      ),
      isRecord: true,
      isNode: true,
    });
  } else if (header.recordTitle) {
    trail.push({ label: String(header.recordTitle), isRecord: true });
  }

  return (
    <div className="erp-shell-breadcrumbs flex shrink-0 items-center gap-2 px-4 py-2">
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="text-xs font-semibold text-[#1a1f26]">
          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1;
            return (
              <React.Fragment key={`${crumb.label}-${index}`}>
                {index > 0 ? <BreadcrumbSeparator /> : null}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage
                      className={`text-xs font-semibold text-[#1a1f26] ${crumb.isRecord ? "truncate max-w-[min(100%,520px)]" : ""}`}
                    >
                      {crumb.isNode ? crumb.label : crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <span className="text-xs font-semibold text-[#1a1f26]">
                      {crumb.isNode ? crumb.label : crumb.label}
                    </span>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

function ErpShellBody({
  children,
  pathname,
  onLogout,
  empresas,
  selectedEmpresaId,
  onSelectEmpresa,
  allowAllEmpresas,
}) {
  return (
    <div className="erp-shell flex h-full min-h-0 w-full overflow-hidden bg-[#f8f9fd]">
      <Sidebar collapsible="offcanvas" className="erp-sidebar border-r border-[#eef1f8] bg-[#f8f9fd]">
        <SidebarHeader className="border-b border-[#e8ecef] p-0">
          <Link to="/CadastroEmpresas" className="erp-sidebar-brand block hover:opacity-95">
            <ErpBrand />
          </Link>
        </SidebarHeader>
        <ErpSidebarNav />
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="erp-shell-main flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#f8f9fd]">
        <div className="erp-shell-content-wrap flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="erp-shell-top-unified shrink-0">
            <ErpTopHeader
              empresas={empresas}
              selectedEmpresaId={selectedEmpresaId}
              onSelectEmpresa={onSelectEmpresa}
              allowAllEmpresas={allowAllEmpresas}
              onLogout={onLogout}
            />
            <ErpBreadcrumbs pathname={pathname} />
          </div>
          <div className="erp-shell-content-area flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}

export default function ErpShell(props) {
  return (
    <SidebarProvider defaultOpen className="h-full max-h-full min-h-0 overflow-hidden">
      <ErpPageHeaderProvider>
        <ErpTableFullscreenProvider>
          <ErpShellBody {...props} />
        </ErpTableFullscreenProvider>
      </ErpPageHeaderProvider>
    </SidebarProvider>
  );
}
