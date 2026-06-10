import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { buildErpBreadcrumbs } from "@/shared/navigation/erpMenuConfig";
import { useErpPageHeader } from "@/shared/layouts/ErpPageHeaderContext";
import ErpRecordMeta from "@/shared/layouts/ErpRecordMeta";
import ErpOperationBadge from "@/shared/layouts/ErpOperationBadge";
import ErpInfoPill from "@/shared/ui/ErpInfoPill";
import FormValidationStatus from "@/framework/cadastro/formularios/FormValidationStatus";

export default function ErpCadastroUnifiedChrome({ pathname }) {
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
    <div className="erp-cadastro-unified-chrome shrink-0">
      <div className="erp-cadastro-unified-chrome__toolbar-row flex min-w-0 w-full items-center gap-2">
        <div className="erp-cadastro-unified-chrome__trail flex min-w-0 shrink-0 items-center gap-1.5">
          <Breadcrumb className="min-w-0">
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
            <>
              <BreadcrumbSeparator className="erp-shell-breadcrumb-separator shrink-0 text-[#94a3b8]" />
              <ErpOperationBadge
                operationLabel={operationLabel}
                className="erp-shell-operation-badge erp-shell-operation-badge--inline shrink-0"
              />
            </>
          ) : null}
          {showRequiredCounter ? (
            <>
              <BreadcrumbSeparator className="erp-shell-breadcrumb-separator erp-shell-status-separator shrink-0 text-[#94a3b8]" />
              <FormValidationStatus
                visible
                variant="inline"
                filled={requiredStatus.filled}
                total={requiredStatus.total}
                pendingFields={requiredStatus.pendingFields}
                className="erp-shell-required-status shrink-0"
              />
            </>
          ) : null}
        </div>

        {header.toolbar ? (
          <div className="erp-cadastro-unified-chrome__actions min-w-0 flex-1">
            {header.toolbar}
          </div>
        ) : null}
      </div>

      {header.tabs ? (
        <div className="erp-cadastro-unified-chrome__tabs-row">
          {header.tabs}
        </div>
      ) : null}
    </div>
  );
}
