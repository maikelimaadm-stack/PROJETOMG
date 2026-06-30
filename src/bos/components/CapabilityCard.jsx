import { Link } from "react-router-dom";
import {
  Building2,
  SlidersHorizontal,
  Layers,
  Calculator,
  GitBranch,
  BarChart3,
  Zap,
  Link2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

const ICON_MAP = {
  building: Building2,
  sliders: SlidersHorizontal,
  layers: Layers,
  calculator: Calculator,
  "git-branch": GitBranch,
  "bar-chart": BarChart3,
  zap: Zap,
  link: Link2,
};

function resolveIcon(name) {
  const Icon = ICON_MAP[name] ?? Layers;
  return Icon;
}

export function CapabilityCard({ capability }) {
  const Icon = resolveIcon(capability.icon);
  const isExpert = capability.audience === "expert";

  return (
    <Card className="bos-card bos-capability-card border-slate-200/80 shadow-sm transition hover:border-sky-300/80 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          {isExpert ? (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
              Especialista
            </Badge>
          ) : (
            <Badge className="bg-emerald-600 text-[10px] hover:bg-emerald-600">Ativa</Badge>
          )}
        </div>
        <CardTitle className="text-base font-semibold text-slate-900">{capability.label}</CardTitle>
        <CardDescription className="text-sm leading-relaxed text-slate-600">
          {capability.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button asChild variant="secondary" size="sm" className="w-full">
          <Link to={capability.operationRoute}>Abrir operação</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default CapabilityCard;
