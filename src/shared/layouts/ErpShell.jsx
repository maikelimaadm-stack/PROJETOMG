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
import ErpOperationBadge from "@/shared/layouts/ErpOperationBadge";
import ErpInfoPill from "@/shared/ui/ErpInfoPill";
import FormValidationStatus from "@/framework/cadastro/formularios/FormValidationStatus";
import ErpCadastroUnifiedChrome from "@/shared/layouts/ErpCadastroUnifiedChrome";

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
    <header className="erp-shell-header flex h-10 shrink-0 items-center justify-between gap-2 bg-white">
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
  } else if (header.pageTitle || header.recordTitle) {
    trail.push({ label: String(header.pageTitle || header.recordTitle), isPageTitle: true });
  }

  const operationLabel = header.operationLabel || header.contextSuffix;
  const requiredStatus = header.requiredStatus;
  const showRequiredCounter =
    requiredStatus?.visible && Number(requiredStatus?.total) > 0;

  return (
    <div className="erp-shell-breadcrumbs flex shrink-0 flex-col gap-1.5">
      <div className="erp-shell-breadcrumbs__trail flex min-w-0 w-full items-center gap-2">
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="erp-shell-breadcrumb-list flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {trail.map((crumb, index) => {
              const isLast = index === trail.length - 1;
              const crumbKey = `${typeof crumb.label === "string" ? crumb.label : "node"}-${index}`;
              return (
                <React.Fragment key={crumbKey}>
                  {index > 0 ? (
                    <BreadcrumbSeparator className="erp-shell-breadcrumb-separator text-[#94a3b8]" />
                  ) : null}
                  <BreadcrumbItem className="inline-flex min-w-0 items-center">
                    {isLast ? (
                      <BreadcrumbPage className="inline-flex min-w-0 items-center p-0">
                        {crumb.isNode ? (
                          crumb.label
                        ) : (
                          <ErpInfoPill
                            className={`erp-shell-breadcrumb-pill ${crumb.isPageTitle ? "erp-shell-breadcrumb-pill--page-title" : ""}`.trim()}
                          >
                            {crumb.label}
                          </ErpInfoPill>
                        )}
                      </BreadcrumbPage>
                    ) : (
                      <ErpInfoPill className="erp-shell-breadcrumb-pill">{crumb.label}</ErpInfoPill>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        {operationLabel ? (
          <ErpOperationBadge
            operationLabel={operationLabel}
            className="erp-shell-operation-badge erp-shell-operation-badge--desktop ml-auto shrink-0"
          />
        ) : null}
      </div>

      {operationLabel || showRequiredCounter ? (
        <div className="erp-shell-breadcrumbs__meta flex w-full min-w-0 flex-wrap items-center gap-1.5">
          {operationLabel ? (
            <ErpOperationBadge
              operationLabel={operationLabel}
              className="erp-shell-operation-badge erp-shell-operation-badge--mobile shrink-0"
            />
          ) : null}
          {operationLabel && showRequiredCounter ? (
            <BreadcrumbSeparator className="erp-shell-breadcrumb-separator erp-shell-status-separator shrink-0 text-[#94a3b8]" />
          ) : null}
          {showRequiredCounter ? (
            <FormValidationStatus
              visible
              variant="inline"
              filled={requiredStatus.filled}
              total={requiredStatus.total}
              pendingFields={requiredStatus.pendingFields}
              className="erp-shell-required-status shrink-0"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ErpShellTopArea({
  pathname,
  empresas,
  selectedEmpresaId,
  onSelectEmpresa,
  allowAllEmpresas,
  onLogout,
}) {
  const { header } = useErpPageHeader();

  return (
    <div className="erp-shell-top-unified shrink-0">
      <ErpTopHeader
        empresas={empresas}
        selectedEmpresaId={selectedEmpresaId}
        onSelectEmpresa={onSelectEmpresa}
        allowAllEmpresas={allowAllEmpresas}
        onLogout={onLogout}
      />
      {!header.unifiedChrome ? <ErpBreadcrumbs pathname={pathname} /> : null}
    </div>
  );
}

function ErpShellContent({ pathname, children }) {
  const { header } = useErpPageHeader();

  if (header.unifiedChrome) {
    return (
      <div className="erp-shell-content-area flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="erp-cadastro-frame flex min-h-0 flex-1 flex-col overflow-hidden">
          <ErpCadastroUnifiedChrome pathname={pathname} />
          <div className="erp-cadastro-frame__body flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="erp-shell-content-area flex min-h-0 flex-1 flex-col overflow-hidden">
      {children}
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
    <div className="erp-shell flex h-full min-h-0 w-full overflow-hidden bg-[var(--background-page)]">
      <Sidebar collapsible="offcanvas" className="erp-sidebar border-r border-[var(--border-color)] bg-[var(--background-page)]">
        <SidebarHeader className="border-b border-[#e8ecef] p-0">
          <Link to="/CadastroEmpresas" className="erp-sidebar-brand block hover:opacity-95">
            <ErpBrand />
          </Link>
        </SidebarHeader>
        <ErpSidebarNav />
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="erp-shell-main flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--background-page)]">
        <div className="erp-shell-content-wrap flex min-h-0 flex-1 flex-col overflow-hidden">
          <ErpShellTopArea
            pathname={pathname}
            empresas={empresas}
            selectedEmpresaId={selectedEmpresaId}
            onSelectEmpresa={onSelectEmpresa}
            allowAllEmpresas={allowAllEmpresas}
            onLogout={onLogout}
          />
          <ErpShellContent pathname={pathname}>{children}</ErpShellContent>
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
