import { Card, CardContent } from "@/shared/ui/card";

export function DecisionPendingSection({ decisions = [], summary, nextAction }) {
  if (!summary && !decisions.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-decision-pending-title">
      <div className="bos-section-heading">
        <h2 id="bos-decision-pending-title" className="bos-section-title">
          Decisões em aberto
        </h2>
        <p className="bos-section-subtitle">
          Decisões que requerem sua avaliação — a plataforma apoia, você decide.
        </p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {nextAction ? (
        <p className="mb-3 text-sm font-medium text-sky-800">
          Próxima ação: {nextAction.label} — {nextAction.context}
        </p>
      ) : null}
      {decisions.length ? (
        <Card className="bos-card border-violet-100 bg-violet-50/20">
          <CardContent className="divide-y divide-violet-100/60 p-0">
            {decisions.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.context}</p>
                <p className="mt-1 text-xs text-sky-700">
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

export function DecisionAlternativesSection({ alternatives = [] }) {
  if (!alternatives.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-decision-alternatives-title">
      <div className="bos-section-heading">
        <h2 id="bos-decision-alternatives-title" className="bos-section-title">
          Alternativas comparáveis
        </h2>
        <p className="bos-section-subtitle">Compare impactos e riscos antes de decidir.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {alternatives.map((item) => (
          <Card key={item.id} className="bos-card border-slate-200/80">
            <CardContent className="py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-600">{item.because}</p>
              <p className="mt-1 text-xs text-emerald-700">Impacto: {item.impact}</p>
              <p className="text-xs text-amber-700">Risco: {item.risk}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function DecisionScenariosSection({ scenarios = [] }) {
  if (!scenarios.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-decision-scenarios-title">
      <div className="bos-section-heading">
        <h2 id="bos-decision-scenarios-title" className="bos-section-title">
          Cenários sugeridos
        </h2>
        <p className="bos-section-subtitle">O que pode acontecer em cada caminho — sem executar por você.</p>
      </div>
      <Card className="bos-card border-slate-200/80">
        <CardContent className="divide-y divide-slate-100 p-0">
          {scenarios.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-600">{item.description}</p>
              <p className="mt-1 text-xs text-emerald-700">Resultado esperado: {item.outcome}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export function DecisionEvidenceSection({ highlights = [], history = [] }) {
  if (!highlights.length && !history.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-decision-evidence-title">
      <div className="bos-section-heading">
        <h2 id="bos-decision-evidence-title" className="bos-section-title">
          Evidências e histórico
        </h2>
        <p className="bos-section-subtitle">Por que esta decisão importa e o que já foi decidido.</p>
      </div>
      {highlights.length ? (
        <Card className="bos-card border-slate-200/80 mb-3">
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
      {history.length ? (
        <div className="text-xs text-slate-500">
          Histórico: {history.map((h) => `${h.label} (${h.status})`).join(" · ")}
        </div>
      ) : null}
    </section>
  );
}

export function DecisionWhySection({ highlights = [] }) {
  if (!highlights.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-decision-why-title">
      <div className="bos-section-heading">
        <h2 id="bos-decision-why-title" className="bos-section-title">
          Por que esta decisão importa
        </h2>
      </div>
      <Card className="bos-card border-slate-200/80">
        <CardContent className="divide-y divide-slate-100 p-0">
          {highlights.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              <p className="text-xs text-sky-700">{item.because}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
