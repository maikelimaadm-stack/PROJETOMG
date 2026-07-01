import { Card, CardContent } from "@/shared/ui/card";

export function FortressComplianceSection({ complianceStatus, rules = [], summary }) {
  if (!complianceStatus && !rules.length && !summary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-fortress-compliance-title">
      <div className="bos-section-heading">
        <h2 id="bos-fortress-compliance-title" className="bos-section-title">
          Status de compliance
        </h2>
        <p className="bos-section-subtitle">Regras ativas que protegem isolamento, exposição e conformidade operacional.</p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {complianceStatus ? (
        <Card className="bos-card border-emerald-100 bg-emerald-50/20">
          <CardContent className="py-4">
            <p className="text-sm font-medium text-slate-900">{complianceStatus.label}</p>
            <p className="text-xs text-slate-600">{complianceStatus.context}</p>
            {complianceStatus.because ? <p className="mt-2 text-xs text-sky-700">Por quê: {complianceStatus.because}</p> : null}
          </CardContent>
        </Card>
      ) : null}
      {rules.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {rules.map((item) => (
            <span
              key={item.id}
              className={`rounded-full px-3 py-1 text-xs ${
                item.status === "active" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
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

export function FortressRetentionSection({ retentionByType = [], archivedData = [], legalHolds = [] }) {
  if (!retentionByType.length && !archivedData.length && !legalHolds.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-fortress-retention-title">
      <div className="bos-section-heading">
        <h2 id="bos-fortress-retention-title" className="bos-section-title">
          Retenção e arquivamento
        </h2>
        <p className="bos-section-subtitle">O que será retido, por quanto tempo, e estados de arquivo e legal hold.</p>
      </div>
      {retentionByType.length ? (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          {retentionByType.map((item) => (
            <Card key={item.id} className="bos-card border-violet-100 bg-violet-50/20">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.context}</p>
                {item.retentionDays != null ? <p className="text-xs text-violet-700">{item.retentionDays} dias</p> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      {legalHolds.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {legalHolds.map((item) => (
            <span key={item.id} className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-800">
              {item.label}: {item.active ? "ativo" : "disponível"}
            </span>
          ))}
        </div>
      ) : null}
      {archivedData.length ? (
        <Card className="bos-card border-slate-200/80">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-slate-900">Dados arquivados</p>
            {archivedData.map((item) => (
              <p key={item.id} className="text-xs text-slate-600">
                {item.label}: {item.context}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

export function FortressAuditSection({ auditedEvents = [], exceptions = [], purgeSummary }) {
  if (!auditedEvents.length && !exceptions.length && !purgeSummary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-fortress-audit-title">
      <div className="bos-section-heading">
        <h2 id="bos-fortress-audit-title" className="bos-section-title">
          Auditoria e trilha de ações sensíveis
        </h2>
        <p className="bos-section-subtitle">Eventos auditados, exceções registradas e controle de expurgo.</p>
      </div>
      {purgeSummary ? (
        <Card className="bos-card mb-3 border-sky-100 bg-sky-50/20">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-slate-900">{purgeSummary.label}</p>
            <p className="text-xs text-slate-600">{purgeSummary.context}</p>
            {purgeSummary.because ? <p className="text-xs text-sky-700">{purgeSummary.because}</p> : null}
          </CardContent>
        </Card>
      ) : null}
      {auditedEvents.length ? (
        <Card className="bos-card mb-3 border-slate-200/80">
          <CardContent className="divide-y divide-slate-100 p-0">
            {auditedEvents.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900">
                  {item.label}
                  {item.sensitive ? " (sensível)" : ""}
                </p>
                <p className="text-xs text-slate-600">{item.context}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {exceptions.length ? (
        <div className="flex flex-wrap gap-2">
          {exceptions.map((item) => (
            <span key={item.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function FortressExposureSection({ exposureBlocks = [], alerts = [], tenantCompliance = [] }) {
  if (!exposureBlocks.length && !alerts.length && !tenantCompliance.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-fortress-exposure-title">
      <div className="bos-section-heading">
        <h2 id="bos-fortress-exposure-title" className="bos-section-title">
          Bloqueios de exposição e alertas
        </h2>
        <p className="bos-section-subtitle">Controles que impedem exposição indevida de dados sensíveis.</p>
      </div>
      {exposureBlocks.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {exposureBlocks.map((item) => (
            <span key={item.id} className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-800">
              {item.label}
            </span>
          ))}
        </div>
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
      {tenantCompliance.length ? (
        <Card className="bos-card border-slate-200/80">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-slate-900">Conformidade por tenant</p>
            {tenantCompliance.map((item) => (
              <p key={item.label} className="text-xs text-slate-600">
                {item.label}: {item.status}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
