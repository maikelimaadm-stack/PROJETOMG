import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function KnowledgeRelationsSection({ relations = [], summary }) {
  if (!summary && !relations.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-knowledge-relations-title">
      <div className="bos-section-heading">
        <h2 id="bos-knowledge-relations-title" className="bos-section-title">
          Relações importantes
        </h2>
        <p className="bos-section-subtitle">
          Conexões entre ativos, fluxos e intenções — conhecimento organizado da operação.
        </p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {relations.length ? (
        <Card className="bos-card border-slate-200/80">
          <CardContent className="divide-y divide-slate-100 p-0">
            {relations.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">
                  {item.fromLabel} → {item.toLabel}
                </p>
                <p className="mt-1 text-xs text-sky-700">{item.because}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

export function KnowledgeDecisionLinksSection({ links = [] }) {
  if (!links.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-decision-links-title">
      <div className="bos-section-heading">
        <h2 id="bos-decision-links-title" className="bos-section-title">
          Decisões e resultados
        </h2>
        <p className="bos-section-subtitle">Como escolhas humanas se conectam aos resultados operacionais.</p>
      </div>
      <Card className="bos-card border-emerald-100 bg-emerald-50/20">
        <CardContent className="divide-y divide-emerald-100/60 p-0">
          {links.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-600">
                {item.fromLabel} → {item.toLabel}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export function KnowledgeContextShortcutsSection({ shortcuts = [] }) {
  if (!shortcuts.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-context-shortcuts-title">
      <div className="bos-section-heading">
        <h2 id="bos-context-shortcuts-title" className="bos-section-title">
          Contexto operacional
        </h2>
        <p className="bos-section-subtitle">Atalhos para entidades relacionadas da operação.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {shortcuts.map((item) => (
          <Card key={item.id} className="bos-card border-slate-200/80">
            <CardContent className="py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.context}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function KnowledgeWhyRelatedSection({ highlights = [] }) {
  if (!highlights.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-why-related-title">
      <div className="bos-section-heading">
        <h2 id="bos-why-related-title" className="bos-section-title">
          Por que isso se relaciona
        </h2>
        <p className="bos-section-subtitle">Explicação em linguagem de negócio — sem estruturas técnicas.</p>
      </div>
      <Card className="bos-card border-violet-100 bg-violet-50/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-violet-900">Vínculos explicáveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
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

export default KnowledgeRelationsSection;
