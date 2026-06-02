import React from "react";
import { Link } from "react-router-dom";
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
import { buildErpBreadcrumbs } from "@/shared/navigation/erpMenuConfig";

const AUTHORIZED_SCOPE_OPTION = "__AUTHORIZED_SCOPE__";

function ErpBrand() {
  return (
    <div className="erp-sidebar-brand flex items-center gap-3 px-3 py-4">
      <div className="erp-sidebar-logo flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#2563eb] text-sm font-bold text-white">
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
  const selectorValue = selectedEmpresaId || (allowAllEmpresas ? "all" : AUTHORIZED_SCOPE_OPTION);

  return (
    <header className="erp-shell-header flex h-12 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="erp-shell-trigger h-8 w-8 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-600">Empresa:</label>
        <select
          value={selectorValue}
          onChange={(event) => onSelectEmpresa(event.target.value)}
          className="erp-shell-company-select h-8 min-w-[180px] rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700"
        >
          {allowAllEmpresas ? <option value="all">Todas as Empresas</option> : null}
          {!allowAllEmpresas ? (
            <option value={AUTHORIZED_SCOPE_OPTION}>Empresas autorizadas</option>
          ) : null}
          {empresas.map((empresa) => (
            <option key={empresa.id} value={empresa.id}>
              {empresa.codempresa} - {empresa.nome_empresa}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="erp-shell-logout h-8 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-800"
      >
        Sair
      </button>
    </header>
  );
}

function ErpBreadcrumbs({ pathname }) {
  const crumbs = buildErpBreadcrumbs(pathname);

  return (
    <div className="erp-shell-breadcrumbs shrink-0 px-1 py-3">
      <Breadcrumb>
        <BreadcrumbList className="text-xs text-slate-500">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <React.Fragment key={`${crumb.label}-${index}`}>
                {index > 0 ? <BreadcrumbSeparator /> : null}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="text-xs font-medium text-slate-700">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <span className="text-xs text-slate-500">{crumb.label}</span>
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

export default function ErpShell({
  children,
  pathname,
  onLogout,
  empresas,
  selectedEmpresaId,
  onSelectEmpresa,
  allowAllEmpresas,
}) {
  return (
    <SidebarProvider defaultOpen>
      <div className="erp-shell flex min-h-svh w-full bg-[#f3f5f8]">
        <Sidebar collapsible="offcanvas" className="erp-sidebar border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-200 p-0">
            <Link to="/CadastroEmpresas" className="block hover:opacity-95">
              <ErpBrand />
            </Link>
          </SidebarHeader>
          <ErpSidebarNav />
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="erp-shell-main min-w-0 bg-[#f3f5f8]">
          <ErpTopHeader
            empresas={empresas}
            selectedEmpresaId={selectedEmpresaId}
            onSelectEmpresa={onSelectEmpresa}
            allowAllEmpresas={allowAllEmpresas}
            onLogout={onLogout}
          />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-1">
            <ErpBreadcrumbs pathname={pathname} />
            <div className="erp-shell-content-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
