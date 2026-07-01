import { Card, CardContent } from "@/shared/ui/card";

export function ImprovementCyclesSection({ cycles = [], summary }) {
  if (!cycles.length && !summary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-improvement-cycles-title">
      <div className="bos-section-heading">
        <h2 id="bos-improvement-cycles-title" className="bos-section-title">
          Ciclos de melhoria em andamento
        </h2>
        <p className="bos-section-subtitle">
          Melhoria contínua baseada em adoções e resultados — decisão final é sempre humana.
        </p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {cycles.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {cycles.map((item) => (
            <Card key={item.id} className="bos-card border-violet-100 bg-violet-50/20">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.context}</p>
                {item.because ? <p className="mt-1 text-xs text-sky-700">Por quê: {item.because}</p> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function OptimizationOpportunitiesSection({ opportunities = [], summary }) {
  if (!opportunities.length && !summary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-optimization-opportunities-title">
      <div className="bos-section-heading">
        <h2 id="bos-optimization-opportunities-title" className="bos-section-title">
          Oportunidades de otimização
        </h2>
        <p className="bos-section-subtitle">Sugestões para reduzir atrito operacional — requerem aprovação.</p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {opportunities.length ? (
        <Card className="bos-card border-slate-200/80">
          <CardContent className="divide-y divide-slate-100 p-0">
            {opportunities.map((item) => (
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

export function ImprovementImpactSection({ validated = [], pending = [], accumulatedImpact }) {
  if (!validated.length && !pending.length && accumulatedImpact == null) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-improvement-impact-title">
      <div className="bos-section-heading">
        <h2 id="bos-improvement-impact-title" className="bos-section-title">
          Impacto acumulado das melhorias
        </h2>
        <p className="bos-section-subtitle">O que funcionou e o que ainda aguarda validação.</p>
      </div>
      {accumulatedImpact != null ? (
        <p className="mb-3 text-sm font-medium text-emerald-800">{accumulatedImpact} melhorias com impacto validado</p>
      ) : null}
      {validated.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {validated.map((m) => (
            <span key={m.id} className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
              {m.label}
            </span>
          ))}
        </div>
      ) : null}
      {pending.length ? (
        <Card className="bos-card border-amber-100 bg-amber-50/20">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-amber-900">Ainda sem efeito confirmado</p>
            {pending.map((item) => (
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

export function OperationalFeedbackLoopSection({ feedbackLoop, patterns = [], benchmarks = [] }) {
  if (!feedbackLoop && !patterns.length && !benchmarks.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-feedback-loop-title">
      <div className="bos-section-heading">
        <h2 id="bos-feedback-loop-title" className="bos-section-title">
          Evolução contínua da operação
        </h2>
        <p className="bos-section-subtitle">Feedback loop entre recomendação, adoção e melhoria real.</p>
      </div>
      {feedbackLoop ? (
        <Card className="bos-card mb-3 border-indigo-100 bg-indigo-50/20">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-slate-900">{feedbackLoop.label}</p>
            <p className="text-xs text-slate-600">{feedbackLoop.context}</p>
          </CardContent>
        </Card>
      ) : null}
      {patterns.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {patterns.map((p) => (
            <span key={p.id} className="rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-800">
              {p.label}
            </span>
          ))}
        </div>
      ) : null}
      {benchmarks.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {benchmarks.map((b) => (
            <Card key={b.id} className="bos-card border-slate-200/80">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{b.label}</p>
                <p className="text-xs text-slate-600">{b.context}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
