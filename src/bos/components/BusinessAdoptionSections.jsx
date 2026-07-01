import { Card, CardContent } from "@/shared/ui/card";

export function AdoptedRecommendationsSection({ adoptions = [], summary }) {
  if (!adoptions.length && !summary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-adopted-title">
      <div className="bos-section-heading">
        <h2 id="bos-adopted-title" className="bos-section-title">
          Recomendações adotadas
        </h2>
        <p className="bos-section-subtitle">
          Melhorias aceitas e em implementação — acompanhamento pertence à empresa.
        </p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {adoptions.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {adoptions.map((item) => (
            <Card key={item.id} className="bos-card border-emerald-100 bg-emerald-50/20">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.context}</p>
                {item.status ? <p className="text-xs text-emerald-700">Status: {item.status}</p> : null}
                {item.progressPercent != null ? (
                  <p className="text-xs text-sky-700">Progresso: {item.progressPercent}%</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function RejectedRecommendationsSection({ rejections = [] }) {
  if (!rejections.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-rejected-title">
      <div className="bos-section-heading">
        <h2 id="bos-rejected-title" className="bos-section-title">
          Recomendações não adotadas
        </h2>
        <p className="bos-section-subtitle">Decisões registradas pela empresa — sem execução automática.</p>
      </div>
      <Card className="bos-card border-slate-200/80">
        <CardContent className="divide-y divide-slate-100 p-0">
          {rejections.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-600">{item.context}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export function AdoptionProgressSection({ progressPercent, milestones = [], plans = [] }) {
  if (progressPercent == null && !milestones.length && !plans.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-adoption-progress-title">
      <div className="bos-section-heading">
        <h2 id="bos-adoption-progress-title" className="bos-section-title">
          Progresso de adoção
        </h2>
        <p className="bos-section-subtitle">Acompanhamento de implementação das melhorias adotadas.</p>
      </div>
      {progressPercent != null ? (
        <p className="mb-3 text-sm font-medium text-slate-800">Progresso geral: {progressPercent}%</p>
      ) : null}
      {plans.length ? (
        <Card className="bos-card mb-3 border-slate-200/80">
          <CardContent className="divide-y divide-slate-100 p-0">
            {plans.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.objective}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {milestones.length ? (
        <div className="flex flex-wrap gap-2">
          {milestones.map((m) => (
            <span key={m.id} className="rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-800">
              {m.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function AdoptionImpactSection({ validatedOutcomes = [], pendingValidation = [] }) {
  if (!validatedOutcomes.length && !pendingValidation.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-adoption-impact-title">
      <div className="bos-section-heading">
        <h2 id="bos-adoption-impact-title" className="bos-section-title">
          Impacto das melhorias
        </h2>
        <p className="bos-section-subtitle">Resultados operacionais após adoção — validados pela empresa.</p>
      </div>
      {validatedOutcomes.length ? (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          {validatedOutcomes.map((item) => (
            <Card key={item.id} className="bos-card border-emerald-100 bg-emerald-50/20">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-emerald-700">{item.impact}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      {pendingValidation.length ? (
        <Card className="bos-card border-amber-100 bg-amber-50/20">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-amber-900">Aguardando validação</p>
            {pendingValidation.map((item) => (
              <p key={item.id} className="text-xs text-amber-800">
                {item.label}: {item.context}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

export function CorporateIntelligenceSection({
  corporateView,
  benchmarks = [],
  references = [],
  variances = [],
  opportunities = [],
  companyComparisons = [],
  groupInsights = [],
  summary,
  healthScore,
}) {
  const hasContent =
    corporateView ||
    benchmarks.length ||
    references.length ||
    variances.length ||
    opportunities.length ||
    companyComparisons.length ||
    groupInsights.length ||
    summary;
  if (!hasContent) return null;

  return (
    <section className="bos-section" aria-labelledby="bos-corporate-title">
      <div className="bos-section-heading">
        <h2 id="bos-corporate-title" className="bos-section-title">
          Visão corporativa autorizada
        </h2>
        <p className="bos-section-subtitle">
          Consolidação entre empresas autorizadas do mesmo cliente — sem mistura de tenants.
        </p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {healthScore != null ? (
        <p className="mb-3 text-sm font-medium text-slate-800">Saúde corporativa: {healthScore}%</p>
      ) : null}
      {corporateView ? (
        <Card className="bos-card mb-3 border-indigo-100 bg-indigo-50/20">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-slate-900">{corporateView.label}</p>
            <p className="text-xs text-slate-600">{corporateView.context}</p>
          </CardContent>
        </Card>
      ) : null}
      {companyComparisons.length ? (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          {companyComparisons.map((c) => (
            <Card
              key={c.id}
              className={`bos-card ${c.isCurrentTenant ? "border-indigo-200 bg-indigo-50/30" : "border-slate-200/80"}`}
            >
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{c.label}</p>
                <p className="text-xs text-slate-600">Progresso: {c.progressPercent}%</p>
                <p className="text-xs text-slate-500">{c.acceptedCount} adoções aceitas</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      {variances.length ? (
        <Card className="bos-card mb-3 border-amber-100 bg-amber-50/20">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-amber-900">Desvios relevantes</p>
            {variances.map((v) => (
              <p key={v.id} className="text-xs text-amber-800">
                {v.label}: {v.context}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {opportunities.length ? (
        <div className="flex flex-wrap gap-2">
          {opportunities.map((o) => (
            <span key={o.id} className="rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-800">
              {o.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
