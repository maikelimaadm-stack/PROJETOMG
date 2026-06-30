import { Card, CardContent } from "@/shared/ui/card";

export function EvolutionTimelineSection({ timeline = [], summary }) {
  if (!summary && !timeline.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-evolution-timeline-title">
      <div className="bos-section-heading">
        <h2 id="bos-evolution-timeline-title" className="bos-section-title">
          Evolução ao longo do tempo
        </h2>
        <p className="bos-section-subtitle">
          Como a empresa evoluiu — memória, decisões e melhorias registradas.
        </p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {timeline.length ? (
        <Card className="bos-card border-slate-200/80">
          <CardContent className="divide-y divide-slate-100 p-0">
            {timeline.map((item) => (
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

export function EvolutionMaturitySection({ capabilities = [], maturityLevel }) {
  if (!capabilities.length && !maturityLevel) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-evolution-maturity-title">
      <div className="bos-section-heading">
        <h2 id="bos-evolution-maturity-title" className="bos-section-title">
          Maturidade organizacional
        </h2>
        <p className="bos-section-subtitle">
          Estágio atual da empresa e capacidades que precisam amadurecer.
        </p>
      </div>
      {maturityLevel ? (
        <p className="mb-3 text-sm font-medium text-emerald-800">
          Nível geral: {maturityLevel}
        </p>
      ) : null}
      {capabilities.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {capabilities.map((item) => (
            <Card key={item.id} className="bos-card border-slate-200/80">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-sky-700">Maturidade: {item.level}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function EvolutionProgressSection({ plans = [], progressSummary, nextSteps }) {
  if (!plans.length && !progressSummary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-evolution-progress-title">
      <div className="bos-section-heading">
        <h2 id="bos-evolution-progress-title" className="bos-section-title">
          Progresso das melhorias
        </h2>
        <p className="bos-section-subtitle">Acompanhamento de metas de evolução — sem execução automática.</p>
      </div>
      {progressSummary?.averageProgress != null ? (
        <p className="mb-3 text-sm text-slate-700">
          Progresso médio: {progressSummary.averageProgress}%
        </p>
      ) : null}
      {nextSteps ? (
        <p className="mb-3 text-sm font-medium text-sky-800">
          Próximo passo: {nextSteps.label} — {nextSteps.context}
        </p>
      ) : null}
      {plans.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {plans.map((item) => (
            <Card key={item.id} className="bos-card border-emerald-100 bg-emerald-50/20">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.objective}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function EvolutionMilestonesSection({ milestones = [], suggestedPaths = [] }) {
  if (!milestones.length && !suggestedPaths.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-evolution-milestones-title">
      <div className="bos-section-heading">
        <h2 id="bos-evolution-milestones-title" className="bos-section-title">
          Marcos e caminhos de evolução
        </h2>
        <p className="bos-section-subtitle">Metas alcançadas e trajetórias sugeridas para a organização.</p>
      </div>
      {milestones.length ? (
        <Card className="bos-card border-slate-200/80 mb-3">
          <CardContent className="divide-y divide-slate-100 p-0">
            {milestones.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {suggestedPaths.length ? (
        <div className="flex flex-wrap gap-2">
          {suggestedPaths.map((item) => (
            <span
              key={item.id}
              className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800"
            >
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function EvolutionWhySection({ highlights = [], periodComparison, decisionImpact = [] }) {
  if (!highlights.length && !periodComparison && !decisionImpact.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-evolution-why-title">
      <div className="bos-section-heading">
        <h2 id="bos-evolution-why-title" className="bos-section-title">
          Por que evoluir agora
        </h2>
        <p className="bos-section-subtitle">Contexto, comparativo e impacto acumulado das decisões.</p>
      </div>
      {periodComparison ? (
        <p className="mb-3 text-sm text-slate-600">
          Maturidade: {periodComparison.maturityLevel} · Eventos: {periodComparison.eventCount} · Progresso: {periodComparison.currentProgress}%
        </p>
      ) : null}
      {highlights.length ? (
        <Card className="bos-card border-slate-200/80 mb-3">
          <CardContent className="divide-y divide-slate-100 p-0">
            {highlights.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="text-xs text-sky-700">{item.because}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {decisionImpact.length ? (
        <div className="text-xs text-slate-500">
          Impacto de decisões: {decisionImpact.map((d) => d.label).join(" · ")}
        </div>
      ) : null}
    </section>
  );
}
