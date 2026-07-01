import { Card, CardContent } from "@/shared/ui/card";

export function GovernanceControlCenterSection({ controlCenter, summary, complianceStatus }) {
  if (!controlCenter && !summary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-governance-control-center-title">
      <div className="bos-section-heading">
        <h2 id="bos-governance-control-center-title" className="bos-section-title">
          Governance Control Center
        </h2>
        <p className="bos-section-subtitle">
          Administração segura de escopos, políticas e compliance — decisões sensíveis exigem aprovação humana.
        </p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {controlCenter ? (
        <Card className="bos-card border-slate-200/80 bg-slate-50/40">
          <CardContent className="py-4">
            <p className="text-sm font-medium text-slate-900">{controlCenter.label}</p>
            <p className="text-xs text-slate-600">{controlCenter.context}</p>
            {controlCenter.because ? <p className="mt-2 text-xs text-sky-700">Por quê: {controlCenter.because}</p> : null}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-700">
              {controlCenter.scopeCount != null ? <span>{controlCenter.scopeCount} escopo(s)</span> : null}
              {controlCenter.policyCount != null ? <span>{controlCenter.policyCount} política(s)</span> : null}
              {controlCenter.complianceStatus ? (
                <span className={controlCenter.complianceStatus === "compliant" ? "text-emerald-800" : "text-amber-800"}>
                  Compliance: {controlCenter.complianceStatus === "compliant" ? "em conformidade" : "revisão necessária"}
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
      {complianceStatus?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {complianceStatus.map((item) => (
            <span
              key={item.id}
              className={`rounded-full px-3 py-1 text-xs ${
                item.status === "compliant" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
              }`}
            >
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function PortfolioControlCenterSection({ portfolioControl }) {
  if (!portfolioControl) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-portfolio-control-center-title">
      <div className="bos-section-heading">
        <h2 id="bos-portfolio-control-center-title" className="bos-section-title">
          Portfolio Control Center
        </h2>
        <p className="bos-section-subtitle">Controles de visibilidade e agregação do portfólio autorizado.</p>
      </div>
      <Card className="bos-card border-indigo-100 bg-indigo-50/20">
        <CardContent className="py-4">
          <p className="text-sm font-medium text-slate-900">{portfolioControl.label}</p>
          <p className="text-xs text-slate-600">{portfolioControl.context}</p>
          {portfolioControl.because ? <p className="mt-2 text-xs text-sky-700">Por quê: {portfolioControl.because}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {portfolioControl.portfolioViewAllowed ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">Visão de portfólio liberada</span>
            ) : (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">Visão de portfólio restrita</span>
            )}
            {portfolioControl.comparisonAllowed ? (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-800">Comparação autorizada</span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function AuthorizedGroupScopesSection({ scopes = [] }) {
  if (!scopes.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-governance-scopes-title">
      <div className="bos-section-heading">
        <h2 id="bos-governance-scopes-title" className="bos-section-title">
          Escopos de grupo autorizados
        </h2>
        <p className="bos-section-subtitle">Empresas habilitadas para visão corporativa e agregação segura.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {scopes.map((item) => (
          <Card key={item.id} className="bos-card border-slate-200/80">
            <CardContent className="py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-600">{item.context}</p>
              {item.tenantCount != null ? <p className="text-xs text-sky-700">{item.tenantCount} empresa(s)</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function GovernancePoliciesSection({ policies = [], permissions = [] }) {
  if (!policies.length && !permissions.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-governance-policies-title">
      <div className="bos-section-heading">
        <h2 id="bos-governance-policies-title" className="bos-section-title">
          Políticas e permissões ativas
        </h2>
        <p className="bos-section-subtitle">Regras que protegem isolamento, visibilidade e agregação corporativa.</p>
      </div>
      {policies.length ? (
        <Card className="bos-card mb-3 border-slate-200/80">
          <CardContent className="divide-y divide-slate-100 p-0">
            {policies.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.context}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {permissions.length ? (
        <div className="flex flex-wrap gap-2">
          {permissions.map((item) => (
            <span
              key={item.id}
              className={`rounded-full px-3 py-1 text-xs ${
                item.granted ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {item.label}
              {item.requiresHumanApproval ? " (aprovação)" : ""}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function RetentionComplianceSection({ retentions = [], compliance = [] }) {
  if (!retentions.length && !compliance.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-governance-retention-title">
      <div className="bos-section-heading">
        <h2 id="bos-governance-retention-title" className="bos-section-title">
          Retenção e compliance
        </h2>
        <p className="bos-section-subtitle">Políticas de retenção e status de conformidade operacional.</p>
      </div>
      {retentions.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {retentions.map((item) => (
            <span key={item.id} className="rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-800">
              {item.label}: {item.retentionDays} dias
            </span>
          ))}
        </div>
      ) : null}
      {compliance.length ? (
        <Card className="bos-card border-emerald-100 bg-emerald-50/20">
          <CardContent className="py-3">
            {compliance.map((item) => (
              <p key={item.id} className="text-xs text-emerald-800">
                {item.label}: {item.context}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

export function GovernanceAuditSection({ auditHistory = [], alerts = [], visibilityZones }) {
  if (!auditHistory.length && !alerts.length && !visibilityZones) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-governance-audit-title">
      <div className="bos-section-heading">
        <h2 id="bos-governance-audit-title" className="bos-section-title">
          Auditoria e zonas de visibilidade
        </h2>
        <p className="bos-section-subtitle">Histórico de governança e controles de exposição corporativa.</p>
      </div>
      {visibilityZones ? (
        <Card className="bos-card mb-3 border-sky-100 bg-sky-50/20">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-slate-900">Zonas autorizadas e bloqueadas</p>
            <p className="text-xs text-slate-600">
              {visibilityZones.exposureAllowed ? "Exposição corporativa permitida no escopo." : "Exposição corporativa restrita."}
            </p>
            {visibilityZones.exposureBecause ? <p className="text-xs text-sky-700">{visibilityZones.exposureBecause}</p> : null}
          </CardContent>
        </Card>
      ) : null}
      {alerts.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {alerts.map((item) => (
            <span
              key={item.id}
              className={`rounded-full px-3 py-1 text-xs ${
                item.severity === "warning" ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-800"
              }`}
            >
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
      {auditHistory.length ? (
        <Card className="bos-card border-slate-200/80">
          <CardContent className="divide-y divide-slate-100 p-0">
            {auditHistory.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.context}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
