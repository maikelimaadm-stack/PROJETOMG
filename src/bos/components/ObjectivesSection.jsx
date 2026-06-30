import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Badge } from "@/shared/ui/badge";

function statusBadge(status) {
  if (status === "active") return { label: "Ativo", className: "bg-emerald-600 hover:bg-emerald-600" };
  return { label: "Planejado", className: "bg-slate-500 hover:bg-slate-500" };
}

export function ObjectivesSection({ objectives }) {
  return (
    <section id="objectives" className="bos-section" aria-labelledby="bos-objectives-title">
      <div className="bos-section-heading">
        <h2 id="bos-objectives-title" className="bos-section-title">
          Objetivos do negócio
        </h2>
        <p className="bos-section-subtitle">
          O que você quer alcançar — não o que o software precisa configurar.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {objectives.map((objective) => {
          const badge = statusBadge(objective.status);
          return (
            <Card key={objective.id} className="bos-card border-slate-200/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-semibold text-slate-900">{objective.title}</CardTitle>
                  <Badge className={`text-[10px] ${badge.className}`}>{badge.label}</Badge>
                </div>
                <CardDescription className="text-xs text-slate-600">{objective.hint}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={objective.progress} className="h-2" />
                <p className="text-xs text-slate-500">{objective.progress}% de progresso estimado</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default ObjectivesSection;
