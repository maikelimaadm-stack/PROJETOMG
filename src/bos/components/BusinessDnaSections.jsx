import { Card, CardContent } from "@/shared/ui/card";

export function BusinessDnaIdentitySection({ headline, narrative, whoIsThisCompany, howThisCompanyWorks }) {
  if (!headline && !narrative && !whoIsThisCompany) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-dna-identity-title">
      <div className="bos-section-heading">
        <h2 id="bos-dna-identity-title" className="bos-section-title">
          Quem é esta empresa operacionalmente
        </h2>
        <p className="bos-section-subtitle">
          Identidade operacional da organização — padrões, maturidade e comportamento recorrente.
        </p>
      </div>
      {headline ? <p className="mb-2 text-sm font-medium text-slate-900">{headline}</p> : null}
      {narrative ? <p className="mb-3 text-sm text-slate-700">{narrative}</p> : null}
      {whoIsThisCompany && whoIsThisCompany !== narrative ? (
        <p className="mb-2 text-sm text-slate-600">{whoIsThisCompany}</p>
      ) : null}
      {howThisCompanyWorks ? (
        <Card className="bos-card border-sky-100 bg-sky-50/30">
          <CardContent className="py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-sky-800">Como esta empresa trabalha</p>
            <p className="mt-1 text-sm text-slate-700">{howThisCompanyWorks}</p>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

export function BusinessDnaFingerprintSection({ traits = [], label }) {
  if (!traits.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-dna-fingerprint-title">
      <div className="bos-section-heading">
        <h2 id="bos-dna-fingerprint-title" className="bos-section-title">
          Fingerprint organizacional
        </h2>
        <p className="bos-section-subtitle">
          {label ?? "Traços distintivos da operação — sempre no nível organizacional, nunca individual."}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {traits.map((item) => (
          <Card key={item.id} className="bos-card border-slate-200/80">
            <CardContent className="py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              {item.because ? <p className="text-xs text-slate-600">{item.because}</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function BusinessDnaMaturitySection({ maturityLevel, capabilities = [], whereMatured = [], whereNeedsEvolution = [] }) {
  if (!capabilities.length && !maturityLevel) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-dna-maturity-title">
      <div className="bos-section-heading">
        <h2 id="bos-dna-maturity-title" className="bos-section-title">
          Maturidade por capacidade
        </h2>
        <p className="bos-section-subtitle">
          Onde a empresa amadureceu e onde ainda precisa evoluir — por domínio operacional.
        </p>
      </div>
      {maturityLevel ? (
        <p className="mb-3 text-sm font-medium text-violet-800">Nível geral: {maturityLevel}</p>
      ) : null}
      {capabilities.length ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          {capabilities.map((item) => (
            <Card key={item.id} className="bos-card border-slate-200/80">
              <CardContent className="py-3">
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-violet-700">Maturidade: {item.level}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      {whereMatured.length ? (
        <p className="mb-2 text-sm text-emerald-800">
          Onde amadureceu: {whereMatured.join(", ")}
        </p>
      ) : null}
      {whereNeedsEvolution.length ? (
        <p className="text-sm text-amber-800">
          Onde precisa evoluir: {whereNeedsEvolution.join(", ")}
        </p>
      ) : null}
    </section>
  );
}

export function BusinessDnaPatternsSection({ operational = [], cultural = [] }) {
  if (!operational.length && !cultural.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-dna-patterns-title">
      <div className="bos-section-heading">
        <h2 id="bos-dna-patterns-title" className="bos-section-title">
          Padrões culturais e operacionais
        </h2>
        <p className="bos-section-subtitle">Comportamentos recorrentes observados na operação da empresa.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {operational.length ? (
          <Card className="bos-card border-slate-200/80">
            <CardContent className="p-0 divide-y divide-slate-100">
              <p className="px-4 py-2 text-xs font-medium uppercase text-slate-500">Operacionais</p>
              {operational.map((item) => (
                <div key={item.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-600">{item.context}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
        {cultural.length ? (
          <Card className="bos-card border-slate-200/80">
            <CardContent className="p-0 divide-y divide-slate-100">
              <p className="px-4 py-2 text-xs font-medium uppercase text-slate-500">Culturais</p>
              {cultural.map((item) => (
                <div key={item.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-600">{item.context}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </section>
  );
}

export function BusinessDnaMilestonesSection({ milestones = [] }) {
  if (!milestones.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-dna-milestones-title">
      <div className="bos-section-heading">
        <h2 id="bos-dna-milestones-title" className="bos-section-title">
          Marcos de evolução do negócio
        </h2>
        <p className="bos-section-subtitle">Marcos que definem como a identidade operacional evoluiu.</p>
      </div>
      <Card className="bos-card border-slate-200/80">
        <CardContent className="divide-y divide-slate-100 p-0">
          {milestones.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-600">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export function BusinessDnaGrowthSignalsSection({ signals = [] }) {
  if (!signals.length) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-dna-growth-title">
      <div className="bos-section-heading">
        <h2 id="bos-dna-growth-title" className="bos-section-title">
          Sinais de crescimento
        </h2>
        <p className="bos-section-subtitle">Oportunidades de amadurecimento identificadas na operação.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {signals.map((item) => (
          <Card key={item.id} className="bos-card border-amber-100 bg-amber-50/20">
            <CardContent className="py-3">
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-600">{item.context}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function BusinessDnaPortfolioSection({ portfolio }) {
  if (!portfolio?.hasPortfolio || !portfolio?.authorized) return null;
  return (
    <section className="bos-section" aria-labelledby="bos-dna-portfolio-title">
      <div className="bos-section-heading">
        <h2 id="bos-dna-portfolio-title" className="bos-section-title">
          Visão de portfólio autorizada
        </h2>
        <p className="bos-section-subtitle">
          Comparativo entre empresas do mesmo grupo — somente com autorização explícita.
        </p>
      </div>
      {portfolio.headline ? <p className="mb-3 text-sm text-slate-700">{portfolio.headline}</p> : null}
      {portfolio.aggregation?.averageMaturityScore != null ? (
        <p className="mb-3 text-sm font-medium text-violet-800">
          Maturidade média do grupo: {portfolio.aggregation.averageMaturityScore}
        </p>
      ) : null}
      {portfolio.aboveAverage?.length ? (
        <p className="mb-2 text-sm text-emerald-800">
          Acima do padrão: {portfolio.aboveAverage.map((c) => c.label ?? c.tenantId).join(", ")}
        </p>
      ) : null}
      {portfolio.belowAverage?.length ? (
        <p className="mb-2 text-sm text-amber-800">
          Abaixo do padrão: {portfolio.belowAverage.map((c) => c.label ?? c.tenantId).join(", ")}
        </p>
      ) : null}
      {portfolio.referenceCompanies?.length ? (
        <Card className="bos-card border-emerald-100 bg-emerald-50/20">
          <CardContent className="py-3">
            <p className="text-xs font-medium uppercase text-emerald-800">Referências no grupo</p>
            {portfolio.referenceCompanies.map((ref) => (
              <p key={ref.tenantId} className="mt-1 text-sm text-slate-700">
                {ref.label} — {ref.because}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
