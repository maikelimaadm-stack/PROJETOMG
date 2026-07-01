import { Card, CardContent } from "@/shared/ui/card";

export function PortfolioCommandCenterSection({ commandCenter, summary, healthScore, belowStandardCount, aboveStandardCount }) {
  if (!commandCenter && !summary) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-portfolio-command-center-title">
      <div className="bos-section-heading">
        <h2 id="bos-portfolio-command-center-title" className="bos-section-title">
          Command Center Corporativo
        </h2>
        <p className="bos-section-subtitle">
          Visão executiva autorizada do grupo — consolidação com isolamento por empresa e decisão humana.
        </p>
      </div>
      {summary ? <p className="mb-3 text-sm text-slate-700">{summary}</p> : null}
      {commandCenter ? (
        <Card className="bos-card border-indigo-100 bg-indigo-50/20">
          <CardContent className="py-4">
            <p className="text-sm font-medium text-slate-900">{commandCenter.label}</p>
            <p className="text-xs text-slate-600">{commandCenter.context}</p>
            {commandCenter.because ? <p className="mt-2 text-xs text-sky-700">Por quê: {commandCenter.because}</p> : null}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-700">
              {commandCenter.healthScore != null ? <span>Saúde: {commandCenter.healthScore}%</span> : null}
              {commandCenter.maturityScore != null ? <span>Maturidade: {commandCenter.maturityScore}</span> : null}
              {commandCenter.companyCount != null ? <span>{commandCenter.companyCount} empresas</span> : null}
              {commandCenter.atRiskCount != null && commandCenter.atRiskCount > 0 ? (
                <span className="text-amber-800">{commandCenter.atRiskCount} em atenção</span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
      {(aboveStandardCount != null || belowStandardCount != null) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {aboveStandardCount != null ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
              {aboveStandardCount} acima do padrão
            </span>
          ) : null}
          {belowStandardCount != null && belowStandardCount > 0 ? (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">
              {belowStandardCount} abaixo do padrão
            </span>
          ) : null}
          {healthScore != null ? (
            <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-800">Saúde do grupo: {healthScore}%</span>
          ) : null}
        </div>
      )}
    </section>
  );
}

export function MultiCompanyHealthSection({ companies = [], benchmarks = [] }) {
  if (!companies.length && !benchmarks.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-portfolio-health-title">
      <div className="bos-section-heading">
        <h2 id="bos-portfolio-health-title" className="bos-section-title">
          Saúde por empresa
        </h2>
        <p className="bos-section-subtitle">Comparativo autorizado entre empresas do mesmo cliente.</p>
      </div>
      {companies.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((item) => (
            <Card key={item.id} className="bos-card border-slate-200/80">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">Saúde operacional: {item.healthScore}%</p>
                {item.isCurrentTenant ? <p className="text-xs text-sky-700">Empresa atual</p> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      {benchmarks.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {benchmarks.map((b) => (
            <span key={b.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              {b.label}: {b.value}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function PortfolioRankingsSection({ rankings = [], leader }) {
  if (!rankings.length && !leader) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-portfolio-rankings-title">
      <div className="bos-section-heading">
        <h2 id="bos-portfolio-rankings-title" className="bos-section-title">
          Ranking autorizado do grupo
        </h2>
        <p className="bos-section-subtitle">Empresas comparadas por saúde operacional — sem execução automática.</p>
      </div>
      {leader ? (
        <p className="mb-3 text-sm text-emerald-800">
          Referência do grupo: {leader.label} ({leader.healthScore ?? leader.score}%)
        </p>
      ) : null}
      {rankings.length ? (
        <Card className="bos-card border-slate-200/80">
          <CardContent className="divide-y divide-slate-100 p-0">
            {rankings.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    #{item.rank} {item.label}
                  </p>
                  {item.isCurrentTenant ? <p className="text-xs text-sky-700">Empresa atual</p> : null}
                </div>
                <span className="text-sm font-medium text-slate-700">{item.score}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

export function PortfolioTrendsSection({ trends = [], evolutionTimeline = [] }) {
  if (!trends.length && !evolutionTimeline.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-portfolio-trends-title">
      <div className="bos-section-heading">
        <h2 id="bos-portfolio-trends-title" className="bos-section-title">
          Tendências e evolução do grupo
        </h2>
        <p className="bos-section-subtitle">Sinais de evolução comparativa entre empresas autorizadas.</p>
      </div>
      {trends.length ? (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          {trends.map((item) => (
            <Card key={item.id} className="bos-card border-violet-100 bg-violet-50/20">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.context}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      {evolutionTimeline.length ? (
        <div className="flex flex-wrap gap-2">
          {evolutionTimeline.map((m) => (
            <span key={m.id} className="rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-800">
              {m.label}: {m.context}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function PortfolioReferencesSection({ references = [], variances = [], opportunities = [] }) {
  if (!references.length && !variances.length && !opportunities.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-portfolio-references-title">
      <div className="bos-section-heading">
        <h2 id="bos-portfolio-references-title" className="bos-section-title">
          Referências, desvios e oportunidades
        </h2>
        <p className="bos-section-subtitle">
          Empresas referência, desvios relevantes e oportunidades corporativas — replicação requer aprovação.
        </p>
      </div>
      {references.length ? (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          {references.map((item) => (
            <Card key={item.id} className="bos-card border-emerald-100 bg-emerald-50/20">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-600">{item.context}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      {variances.length ? (
        <Card className="bos-card mb-3 border-amber-100 bg-amber-50/20">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-amber-900">Desvios que merecem atenção</p>
            {variances.map((item) => (
              <p key={item.id} className="text-xs text-amber-800">
                {item.label}: {item.context}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {opportunities.length ? (
        <div className="flex flex-wrap gap-2">
          {opportunities.map((item) => (
            <span key={item.id} className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-800">
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function PortfolioAlertsSection({ alerts = [], standardization = [], capabilityRadar }) {
  if (!alerts.length && !standardization.length && !capabilityRadar) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-portfolio-alerts-title">
      <div className="bos-section-heading">
        <h2 id="bos-portfolio-alerts-title" className="bos-section-title">
          Alertas executivos e padronização
        </h2>
        <p className="bos-section-subtitle">Sinais do grupo para decisão executiva — não substituem o gestor.</p>
      </div>
      {alerts.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {alerts.map((item) => (
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
      {standardization.length ? (
        <Card className="bos-card mb-3 border-slate-200/80">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-slate-900">Padrões emergentes no grupo</p>
            {standardization.map((item) => (
              <p key={item.id} className="text-xs text-slate-600">
                {item.label}: {item.context}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {capabilityRadar?.companies?.length ? (
        <div className="flex flex-wrap gap-2">
          {capabilityRadar.companies.map((c) => (
            <span key={c.label} className="rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-800">
              {c.label}: {c.maturityLevel}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
