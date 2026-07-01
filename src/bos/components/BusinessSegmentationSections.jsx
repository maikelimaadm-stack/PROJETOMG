import { Card, CardContent } from "@/shared/ui/card";

export function SegmentationProfileSection({ segmentLabel, narrative, summary }) {
  if (!segmentLabel && !narrative && !summary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-segment-profile-title">
      <div className="bos-section-heading">
        <h2 id="bos-segment-profile-title" className="bos-section-title">
          Segmento operacional da empresa
        </h2>
        <p className="bos-section-subtitle">
          Classificação do perfil operacional — sempre no nível organizacional.
        </p>
      </div>
      {segmentLabel ? (
        <p className="mb-2 text-sm font-medium text-indigo-900">{segmentLabel}</p>
      ) : null}
      {narrative ? <p className="mb-3 text-sm text-slate-700">{narrative}</p> : null}
      {summary && summary !== narrative ? (
        <p className="text-sm text-slate-600">{summary}</p>
      ) : null}
    </section>
  );
}

export function CompatibleTemplatesSection({ templates = [], headline }) {
  if (!templates.length && !headline) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-templates-title">
      <div className="bos-section-heading">
        <h2 id="bos-templates-title" className="bos-section-title">
          Templates compatíveis com o perfil
        </h2>
        <p className="bos-section-subtitle">
          Caminhos reutilizáveis para acelerar a evolução — sem configurar tecnologia.
        </p>
      </div>
      {headline ? <p className="mb-3 text-sm text-slate-700">{headline}</p> : null}
      {templates.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((item) => (
            <Card key={item.id} className="bos-card border-indigo-100 bg-indigo-50/20">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-indigo-700">Compatibilidade: {item.compatibility}%</p>
                <p className="mt-1 text-xs text-slate-600">{item.context}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function AdvancedMaturitySection({ score, radar, priorityCapabilities = [], progress }) {
  if (score == null && !radar?.domains?.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-advanced-maturity-title">
      <div className="bos-section-heading">
        <h2 id="bos-advanced-maturity-title" className="bos-section-title">
          Maturidade avançada por capacidade
        </h2>
        <p className="bos-section-subtitle">
          Score ponderado e capacidades prioritárias para evolução.
        </p>
      </div>
      {score != null ? (
        <p className="mb-3 text-sm font-medium text-violet-800">
          Score avançado: {score}
          {progress?.vsGroup ? ` · vs grupo: ${progress.vsGroup}` : ""}
        </p>
      ) : null}
      {radar?.domains?.length ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          {radar.domains.map((item) => (
            <Card key={item.id} className="bos-card border-slate-200/80">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-violet-700">
                  Nível: {item.level} · Score: {item.weightedScore ?? item.score}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      {priorityCapabilities.length ? (
        <p className="text-sm text-amber-800">
          Priorizar: {priorityCapabilities.join(", ")}
        </p>
      ) : null}
    </section>
  );
}

export function SegmentationBenchmarksSection({ benchmarks = [] }) {
  if (!benchmarks.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-segment-benchmarks-title">
      <div className="bos-section-heading">
        <h2 id="bos-segment-benchmarks-title" className="bos-section-title">
          Benchmarks autorizados
        </h2>
        <p className="bos-section-subtitle">Referências internas de maturidade da empresa e do grupo.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {benchmarks.map((item) => (
          <Card key={item.id} className="bos-card border-slate-200/80">
            <CardContent className="py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-sky-700">Score: {item.score}</p>
              <p className="text-xs text-slate-600">{item.context}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function AccelerationSuggestionsSection({ suggestions = [] }) {
  if (!suggestions.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-acceleration-title">
      <div className="bos-section-heading">
        <h2 id="bos-acceleration-title" className="bos-section-title">
          Sugestões de aceleração
        </h2>
        <p className="bos-section-subtitle">Caminhos sugeridos com base no DNA e segmento operacional.</p>
      </div>
      <Card className="bos-card border-emerald-100 bg-emerald-50/20">
        <CardContent className="divide-y divide-emerald-100/60 p-0">
          {suggestions.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-600">{item.because}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export function SegmentationGroupSection({ groupComparison, patternSuggestions }) {
  if (!groupComparison?.authorized && !patternSuggestions?.authorized) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-segment-group-title">
      <div className="bos-section-heading">
        <h2 id="bos-segment-group-title" className="bos-section-title">
          Comparativo e padrões do grupo autorizado
        </h2>
        <p className="bos-section-subtitle">
          Empresas semelhantes, referências e práticas replicáveis — somente com autorização.
        </p>
      </div>
      {groupComparison?.groupAverage != null ? (
        <p className="mb-3 text-sm font-medium text-violet-800">
          Maturidade média do grupo: {groupComparison.groupAverage}
        </p>
      ) : null}
      {groupComparison?.similarCompanies?.length ? (
        <p className="mb-2 text-sm text-indigo-800">
          Perfis semelhantes:{" "}
          {groupComparison.similarCompanies.map((c) => c.label ?? c.tenantId).join(", ")}
        </p>
      ) : null}
      {patternSuggestions?.suggestions?.length ? (
        <Card className="bos-card border-slate-200/80">
          <CardContent className="divide-y divide-slate-100 p-0">
            {patternSuggestions.suggestions.map((item, i) => (
              <div key={`${item.type}-${i}`} className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.because}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
