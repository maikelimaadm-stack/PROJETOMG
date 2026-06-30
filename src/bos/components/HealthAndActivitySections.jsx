import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Activity } from "lucide-react";

function toneClass(tone) {
  if (tone === "good") return "text-emerald-700 bg-emerald-50";
  if (tone === "warn") return "text-amber-700 bg-amber-50";
  return "text-slate-600 bg-slate-100";
}

export function HealthSummarySection({ health }) {
  return (
    <section id="health" className="bos-section" aria-labelledby="bos-health-title">
      <div className="bos-section-heading">
        <h2 id="bos-health-title" className="bos-section-title">
          Saúde do negócio
        </h2>
        <p className="bos-section-subtitle">Visão executiva — indicadores operacionais, não métricas técnicas.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card className="bos-card border-slate-200/80">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-sky-700">
              <Activity className="h-4 w-4" aria-hidden />
              <CardTitle className="text-sm font-semibold">{health.label}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-4xl font-bold text-slate-900">{health.score}</div>
            <Progress value={health.score} className="h-2" />
            <p className="text-xs capitalize text-slate-500">Tendência: {health.trend}</p>
          </CardContent>
        </Card>
        <Card className="bos-card border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Destaques</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            {health.highlights.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg px-3 py-2 text-xs ${toneClass(item.tone)}`}
              >
                <div className="font-medium">{item.label}</div>
                <div className="mt-1 opacity-90">{item.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function ActivityTeaserSection({ items }) {
  return (
    <section className="bos-section" aria-labelledby="bos-activity-title">
      <div className="bos-section-heading">
        <h2 id="bos-activity-title" className="bos-section-title">
          Atividade recente
        </h2>
        <p className="bos-section-subtitle">Teaser de memória empresarial — contexto do que aconteceu no negócio.</p>
      </div>
      <Card className="bos-card border-slate-200/80">
        <CardContent className="divide-y divide-slate-100 p-0">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.context}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{item.when}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export default HealthSummarySection;
