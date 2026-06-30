import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function MemoryOperationalSummarySection({ summary, evolutionSignal }) {
  if (!summary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-memory-summary-title">
      <div className="bos-section-heading">
        <h2 id="bos-memory-summary-title" className="bos-section-title">
          Memória operacional
        </h2>
        <p className="bos-section-subtitle">
          Histórico preservado da empresa — o que aconteceu, por quê e qual foi o impacto.
        </p>
      </div>
      <Card className="bos-card border-slate-200/80">
        <CardContent className="space-y-2 py-4">
          <p className="text-sm text-slate-800">{summary}</p>
          {evolutionSignal ? (
            <p className="text-xs text-sky-700">{evolutionSignal}</p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

export function MemoryDecisionsSection({ decisions = [] }) {
  if (!decisions.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-decisions-title">
      <div className="bos-section-heading">
        <h2 id="bos-decisions-title" className="bos-section-title">
          Últimas decisões
        </h2>
        <p className="bos-section-subtitle">Escolhas humanas registradas — aprovações, rejeições e retornos.</p>
      </div>
      <Card className="bos-card border-slate-200/80">
        <CardContent className="divide-y divide-slate-100 p-0">
          {decisions.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.context}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export function MemoryWorkflowsSection({ workflows = [] }) {
  if (!workflows.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-workflows-memory-title">
      <div className="bos-section-heading">
        <h2 id="bos-workflows-memory-title" className="bos-section-title">
          Fluxos recentes
        </h2>
        <p className="bos-section-subtitle">Processos de aprovação e validação em andamento ou concluídos.</p>
      </div>
      <Card className="bos-card border-slate-200/80">
        <CardContent className="divide-y divide-slate-100 p-0">
          {workflows.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.context}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export function MemoryWhySection({ highlights = [], replayTeaser }) {
  if (!highlights.length && !replayTeaser?.summary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-why-title">
      <div className="bos-section-heading">
        <h2 id="bos-why-title" className="bos-section-title">
          Por que isso aconteceu
        </h2>
        <p className="bos-section-subtitle">Contexto explicável — sem logs técnicos, em linguagem de negócio.</p>
      </div>
      <Card className="bos-card border-violet-100 bg-violet-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-violet-900">Replay resumido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {replayTeaser?.summary ? (
            <p className="text-xs text-violet-800">{replayTeaser.summary}</p>
          ) : null}
          {highlights.map((item) => (
            <div key={item.id} className="rounded-md bg-white/80 px-3 py-2">
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-600">{item.because}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export default MemoryOperationalSummarySection;
