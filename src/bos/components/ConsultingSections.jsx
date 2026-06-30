import { Card, CardContent } from "@/shared/ui/card";

export function ConsultingOpportunitiesSection({ opportunities = [], summary }) {
  if (!summary && !opportunities.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-consulting-opportunities-title">
      <div className="bos-section-heading">
        <h2 id="bos-consulting-opportunities-title" className="bos-section-title">
          Oportunidades de melhoria
        </h2>
        <p className="bos-section-subtitle">
          Pontos de evolução identificados a partir da operação — sugestões, não imposições.
        </p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {opportunities.length ? (
        <Card className="bos-card border-amber-100 bg-amber-50/20">
          <CardContent className="divide-y divide-amber-100/60 p-0">
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

export function ConsultingRecommendationsSection({ recommendations = [], priorities = [] }) {
  if (!recommendations.length && !priorities.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-consulting-recommendations-title">
      <div className="bos-section-heading">
        <h2 id="bos-consulting-recommendations-title" className="bos-section-title">
          Recomendações operacionais
        </h2>
        <p className="bos-section-subtitle">
          Sugestões explicáveis com impacto esperado — requerem aprovação humana para execução.
        </p>
      </div>
      {priorities.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {priorities.map((item) => (
            <span
              key={item.id}
              className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-800"
            >
              Prioridade: {item.label}
            </span>
          ))}
        </div>
      ) : null}
      {recommendations.length ? (
        <Card className="bos-card border-slate-200/80">
          <CardContent className="divide-y divide-slate-100 p-0">
            {recommendations.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.explanation}</p>
                <p className="mt-1 text-xs text-emerald-700">Impacto esperado: {item.expectedImpact}</p>
                <p className="text-xs text-sky-700">
                  Confiança: {item.confidence} · Evidências: {item.evidenceCount}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

export function ConsultingPlansSection({ plans = [], evolutionTracking = [] }) {
  if (!plans.length && !evolutionTracking.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-consulting-plans-title">
      <div className="bos-section-heading">
        <h2 id="bos-consulting-plans-title" className="bos-section-title">
          Planos de melhoria
        </h2>
        <p className="bos-section-subtitle">
          Caminhos sugeridos para evolução — acompanhe e aprove antes de executar.
        </p>
      </div>
      {plans.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {plans.map((item) => (
            <Card key={item.id} className="bos-card border-sky-100 bg-sky-50/20">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.objective}</p>
                {item.nextSteps?.length ? (
                  <ul className="mt-2 list-inside list-disc text-xs text-slate-500">
                    {item.nextSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      {evolutionTracking.length ? (
        <div className="mt-3 text-xs text-slate-500">
          Acompanhamento: {evolutionTracking.map((e) => e.label).join(" · ")}
        </div>
      ) : null}
    </section>
  );
}

export function ConsultingEvidenceSection({ highlights = [] }) {
  if (!highlights.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-consulting-evidence-title">
      <div className="bos-section-heading">
        <h2 id="bos-consulting-evidence-title" className="bos-section-title">
          Por que estas sugestões existem
        </h2>
        <p className="bos-section-subtitle">
          Contexto e evidências que sustentam a consultoria operacional da empresa.
        </p>
      </div>
      <Card className="bos-card border-slate-200/80">
        <CardContent className="divide-y divide-slate-100 p-0">
          {highlights.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-600">{item.because}</p>
              <p className="mt-1 text-xs text-sky-700">{item.impact}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
