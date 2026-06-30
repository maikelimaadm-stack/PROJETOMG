import { Link } from "react-router-dom";
import {
  Calculator,
  GitBranch,
  BarChart3,
  Zap,
  Link2,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

const ICON_MAP = {
  calculator: Calculator,
  "git-branch": GitBranch,
  "bar-chart": BarChart3,
  zap: Zap,
  link: Link2,
  layers: Layers,
};

function statusLabel(status) {
  if (status === "available") return { text: "Disponível", variant: "default" };
  return { text: "Em breve", variant: "secondary" };
}

export function AssetCard({ assetType }) {
  const Icon = ICON_MAP[assetType.icon] ?? Layers;
  const status = statusLabel(assetType.status);

  return (
    <Card className="bos-card bos-asset-card border-slate-200/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <Badge variant={status.variant} className="text-[10px]">
            {status.text}
          </Badge>
        </div>
        <CardTitle className="text-base font-semibold text-slate-900">{assetType.label}</CardTitle>
        <CardDescription className="text-sm text-slate-600">{assetType.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {assetType.status === "available" && assetType.createRoute ? (
          <div className="flex flex-col gap-2">
            <Button asChild size="sm" className="w-full">
              <Link to={assetType.createRoute}>Criar ativo</Link>
            </Button>
            {assetType.inboxRoute ? (
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to={assetType.inboxRoute}>Ver pendências</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-full" disabled>
            Disponível na próxima fase
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default AssetCard;
