import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Lightbulb } from "lucide-react";

export function RecommendationsSection({ recommendations }) {
  return (
    <section className="bos-section" aria-labelledby="bos-recommendations-title">
      <div className="bos-section-heading">
        <h2 id="bos-recommendations-title" className="bos-section-title">
          Próximas ações recomendadas
        </h2>
        <p className="bos-section-subtitle">Sugestões explicáveis — você decide o que aplicar.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {recommendations.map((item) => (
          <Card key={item.id} className="bos-card border-slate-200/80">
            <CardHeader className="pb-2">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <Lightbulb className="h-4 w-4" aria-hidden />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold text-slate-900">{item.title}</CardTitle>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {item.confidence}
                </Badge>
              </div>
              <CardDescription className="text-xs leading-relaxed text-slate-600">
                {item.explanation}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild size="sm" variant="secondary" className="w-full">
                <Link to={item.actionRoute}>{item.actionLabel}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default RecommendationsSection;
