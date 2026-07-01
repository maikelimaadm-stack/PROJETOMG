import { Card, CardContent } from "@/shared/ui/card";

export function PriorityRecommendationsSection({ recommendations = [], summary }) {
  if (!recommendations.length && !summary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-recommendations-title">
      <div className="bos-section-heading">
        <h2 id="bos-recommendations-title" className="bos-section-title">
          Recomendações prioritárias
        </h2>
        <p className="bos-section-subtitle">
          Sugestões de melhoria baseadas no contexto operacional — decisão final é sempre humana.
        </p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {recommendations.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {recommendations.map((item) => (
            <Card key={item.id} className="bos-card border-rose-100 bg-rose-50/20">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.context}</p>
                {item.expectedImpact ? (
                  <p className="mt-1 text-xs text-emerald-700">Impacto: {item.expectedImpact}</p>
                ) : null}
                {item.because ? (
                  <p className="mt-1 text-xs text-sky-700">Por quê: {item.because}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function SuggestedPlansSection({ plans = [] }) {
  if (!plans.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-suggested-plans-title">
      <div className="bos-section-heading">
        <h2 id="bos-suggested-plans-title" className="bos-section-title">
          Planos de melhoria sugeridos
        </h2>
        <p className="bos-section-subtitle">Trajetórias propostas — requerem aprovação antes de execução.</p>
      </div>
      <Card className="bos-card border-slate-200/80">
        <CardContent className="divide-y divide-slate-100 p-0">
          {plans.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-600">{item.objective}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export function ReplicablePracticesSection({ practices = [], summary }) {
  if (!practices.length && !summary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-replication-title">
      <div className="bos-section-heading">
        <h2 id="bos-replication-title" className="bos-section-title">
          Práticas replicáveis autorizadas
        </h2>
        <p className="bos-section-subtitle">
          Boas práticas de empresas do grupo — replicação assistida, nunca automática.
        </p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {practices.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {practices.map((item) => (
            <Card key={item.id} className="bos-card border-teal-100 bg-teal-50/20">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.context}</p>
                {item.compatibility != null ? (
                  <p className="text-xs text-teal-700">Compatibilidade: {item.compatibility}%</p>
                ) : null}
                {item.howToReplicateSafely ? (
                  <p className="mt-1 text-xs text-amber-800">{item.howToReplicateSafely}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function RecommendationWhySection({ highlights = [], nextSteps }) {
  if (!highlights.length && !nextSteps) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-recommendation-why-title">
      <div className="bos-section-heading">
        <h2 id="bos-recommendation-why-title" className="bos-section-title">
          Por que estas recomendações
        </h2>
        <p className="bos-section-subtitle">Contexto e evidências por trás das sugestões.</p>
      </div>
      {nextSteps ? (
        <p className="mb-3 text-sm font-medium text-sky-800">
          Próximo passo: {nextSteps.label} — {nextSteps.context}
        </p>
      ) : null}
      {highlights.length ? (
        <Card className="bos-card border-slate-200/80">
          <CardContent className="divide-y divide-slate-100 p-0">
            {highlights.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-600">{item.because}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
