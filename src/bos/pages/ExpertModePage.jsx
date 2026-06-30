import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { buildBosAssetTypes } from "@/bos/config/bosAssetCatalog";
import { buildBosCapabilities } from "@/bos/config/bosCapabilityCatalog";
import { AlertTriangle } from "lucide-react";

export default function ExpertModePage() {
  const assetTypes = buildBosAssetTypes().filter((item) => item.status === "available");
  const expertCapabilities = buildBosCapabilities().filter((cap) => cap.audience === "expert");

  return (
    <div className="bos-page">
      <Link to="/" className="text-xs text-sky-700 hover:underline">
        ← Voltar ao início
      </Link>

      <h1 className="bos-page-title mt-4">Modo especialista</h1>
      <p className="bos-page-lead">
        Exceção controlada para proprietários de processo. Você trabalha com vocabulário de negócio
        avançado — sem Formula Builder, AST, JSON ou designers técnicos.
      </p>

      <div className="bos-notice flex gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          Expert Mode não abre Studio nem Formula Builder. Ferramentas técnicas permanecem restritas à
          engenharia de plataforma.
        </span>
      </div>

      <section className="mt-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Ativos disponíveis</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {assetTypes.map((asset) => (
            <Card key={asset.assetType} className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{asset.label}</CardTitle>
                <CardDescription className="text-xs">{asset.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="sm" variant="secondary">
                  <Link to={asset.createRoute}>Editar como ativo</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {expertCapabilities.length > 0 ? (
        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Operações avançadas</h2>
          {expertCapabilities.map((cap) => (
            <Link
              key={cap.capabilityId}
              to={cap.operationRoute}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm hover:border-violet-300"
            >
              <span>{cap.label}</span>
              <span className="text-xs text-violet-700">Abrir →</span>
            </Link>
          ))}
        </section>
      ) : null}
    </div>
  );
}
