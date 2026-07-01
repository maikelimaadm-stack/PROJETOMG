import { Card, CardContent } from "@/shared/ui/card";

export function LifecycleStatusSection({ lifecycleStatus, lifecycleByType = [], summary }) {
  if (!lifecycleStatus && !lifecycleByType.length && !summary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-lifecycle-status-title">
      <div className="bos-section-heading">
        <h2 id="bos-lifecycle-status-title" className="bos-section-title">
          Ciclo de vida dos dados
        </h2>
        <p className="bos-section-subtitle">Status de retenção, arquivo, hold e expurgo controlado por tipo de dado.</p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {lifecycleStatus ? (
        <Card className="bos-card border-indigo-100 bg-indigo-50/20">
          <CardContent className="py-4">
            <p className="text-sm font-medium text-slate-900">{lifecycleStatus.label}</p>
            <p className="text-xs text-slate-600">{lifecycleStatus.context}</p>
            {lifecycleStatus.because ? <p className="mt-2 text-xs text-indigo-700">Por quê: {lifecycleStatus.because}</p> : null}
          </CardContent>
        </Card>
      ) : null}
      {lifecycleByType.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {lifecycleByType.map((item) => (
            <span
              key={item.id}
              className={`rounded-full px-3 py-1 text-xs ${
                item.status === "active" ? "bg-indigo-50 text-indigo-800" : "bg-amber-50 text-amber-800"
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

export function LifecycleArchiveHoldSection({ archivedRecords = [], legalHolds = [], retentionPolicies = [] }) {
  if (!archivedRecords.length && !legalHolds.length && !retentionPolicies.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-lifecycle-archive-title">
      <div className="bos-section-heading">
        <h2 id="bos-lifecycle-archive-title" className="bos-section-title">
          Arquivamento, hold e retenção
        </h2>
        <p className="bos-section-subtitle">Registros arquivados, legal hold ativo e políticas de retenção em vigor.</p>
      </div>
      {retentionPolicies.length ? (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          {retentionPolicies.map((item) => (
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
      {archivedRecords.length ? (
        <Card className="bos-card border-slate-200/80">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-slate-900">Registros arquivados</p>
            {archivedRecords.map((item) => (
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

export function LifecycleApprovalSection({
  pendingApprovals = [],
  expungeableRecords = [],
  blockReasons = [],
  onApprove,
  onReject,
  approvedActions = [],
  rejectedActions = [],
}) {
  if (
    !pendingApprovals.length &&
    !expungeableRecords.length &&
    !blockReasons.length &&
    !approvedActions.length &&
    !rejectedActions.length
  ) {
    return null;
  }
  return (
    <section className="bos-section" aria-labelledby="bos-lifecycle-approval-title">
      <div className="bos-section-heading">
        <h2 id="bos-lifecycle-approval-title" className="bos-section-title">
          Aprovações e expurgo controlado
        </h2>
        <p className="bos-section-subtitle">Aprove ou rejeite ações sensíveis com trilha durável de auditoria.</p>
      </div>
      {pendingApprovals.length ? (
        <Card className="bos-card mb-3 border-amber-100 bg-amber-50/20">
          <CardContent className="divide-y divide-slate-100 p-0">
            {pendingApprovals.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-600">{item.context}</p>
                  {item.because ? <p className="text-xs text-amber-700">{item.because}</p> : null}
                </div>
                {onApprove && onReject ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      onClick={() => onApprove(item.id)}
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      onClick={() => onReject(item.id)}
                    >
                      Rejeitar
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {approvedActions.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {approvedActions.map((item) => (
            <span key={item.id} className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
              Aprovado: {item.label}
            </span>
          ))}
        </div>
      ) : null}
      {rejectedActions.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {rejectedActions.map((item) => (
            <span key={item.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              Rejeitado: {item.label}
            </span>
          ))}
        </div>
      ) : null}
      {blockReasons.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {blockReasons.map((item) => (
            <span key={item.id} className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-800">
              Bloqueado: {item.label}
            </span>
          ))}
        </div>
      ) : null}
      {expungeableRecords.length ? (
        <Card className="bos-card border-sky-100 bg-sky-50/20">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-slate-900">Expurgo controlado</p>
            {expungeableRecords.map((item) => (
              <p key={item.id} className="text-xs text-slate-600">
                {item.label}: {item.allowed ? "permitido" : "bloqueado"} — {item.context}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

export function LifecycleAuditSection({
  lifecycleHistory = [],
  auditTrailByDocument = [],
  expirationAlerts = [],
  durableAuditTrail = [],
  executionQueue = [],
}) {
  if (
    !lifecycleHistory.length &&
    !auditTrailByDocument.length &&
    !expirationAlerts.length &&
    !durableAuditTrail.length &&
    !executionQueue.length
  ) {
    return null;
  }
  return (
    <section className="bos-section" aria-labelledby="bos-lifecycle-audit-title">
      <div className="bos-section-heading">
        <h2 id="bos-lifecycle-audit-title" className="bos-section-title">
          Histórico e trilha de auditoria
        </h2>
        <p className="bos-section-subtitle">Ações de lifecycle executadas, bloqueadas ou aguardando revisão.</p>
      </div>
      {lifecycleHistory.length ? (
        <Card className="bos-card mb-3 border-slate-200/80">
          <CardContent className="divide-y divide-slate-100 p-0">
            {lifecycleHistory.map((item) => (
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
      {executionQueue.length ? (
        <Card className="bos-card mb-3 border-indigo-100 bg-indigo-50/20">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-slate-900">Fila de execução</p>
            {executionQueue.map((item) => (
              <p key={item.id} className="text-xs text-slate-600">
                {item.label}: {item.status} — {item.context}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {durableAuditTrail.length ? (
        <Card className="bos-card mb-3 border-slate-200/80">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-slate-900">Trilha de auditoria durável</p>
            {durableAuditTrail.map((item) => (
              <p key={item.id} className="text-xs text-slate-600">
                {item.label}: {item.context}{item.approved ? " — aprovado" : ""}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {auditTrailByDocument.length ? (
        <Card className="bos-card mb-3 border-slate-200/80">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-slate-900">Trilha por documento</p>
            {auditTrailByDocument.map((item) => (
              <p key={item.id} className="text-xs text-slate-600">
                {item.label} ({item.context}){item.approved ? " — aprovado" : ""}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {expirationAlerts.length ? (
        <div className="flex flex-wrap gap-2">
          {expirationAlerts.map((item) => (
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
    </section>
  );
}

export function LifecycleControlCenterSection({ controlCenter, dataStates = [] }) {
  if (!controlCenter && !dataStates.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-lifecycle-control-title">
      <div className="bos-section-heading">
        <h2 id="bos-lifecycle-control-title" className="bos-section-title">
          Centro de controle de dados sensíveis
        </h2>
        <p className="bos-section-subtitle">Visão administrativa consolidada do ciclo de vida corporativo autorizado.</p>
      </div>
      {controlCenter ? (
        <Card className="bos-card border-indigo-100 bg-indigo-50/20">
          <CardContent className="py-4">
            <p className="text-sm font-medium text-slate-900">{controlCenter.label}</p>
            <p className="text-xs text-slate-600">{controlCenter.context}</p>
            {controlCenter.pendingApprovals != null ? (
              <p className="mt-2 text-xs text-indigo-700">{controlCenter.pendingApprovals} aprovações pendentes</p>
            ) : null}
            {controlCenter.because ? <p className="text-xs text-indigo-600">{controlCenter.because}</p> : null}
          </CardContent>
        </Card>
      ) : null}
      {dataStates.length ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {dataStates.map((item) => (
            <Card key={item.id} className="bos-card border-slate-200/80">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.context}</p>
                {item.currentState ? <p className="text-xs text-slate-500">Estado: {item.currentState}</p> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
