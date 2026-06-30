import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { buildBosCapabilities } from "@/bos/config/bosCapabilityCatalog";
import { buildBosAssetTypes } from "@/bos/config/bosAssetCatalog";
import {
  buildDefaultObjectives,
  buildExplainableSuggestions,
  buildRecentActivity,
  buildHealthSummary,
} from "@/bos/config/bosHomeContent";
import { BOS_AUTHORING_ENTRIES } from "@/bos/config/bosNavConfig";
import CapabilityCard from "@/bos/components/CapabilityCard";
import AssetCard from "@/bos/components/AssetCard";
import ObjectivesSection from "@/bos/components/ObjectivesSection";
import RecommendationsSection from "@/bos/components/RecommendationsSection";
import AuthoringEntryPanel from "@/bos/components/AuthoringEntryPanel";
import {
  HealthSummarySection,
  ActivityTeaserSection,
} from "@/bos/components/HealthAndActivitySections";
import { useAuth } from "@/shared/contexts/AuthContext";

export default function BosHomePage() {
  const { user, cliente } = useAuth();
  const capabilities = buildBosCapabilities();
  const assetTypes = buildBosAssetTypes();
  const objectives = buildDefaultObjectives();
  const recommendations = buildExplainableSuggestions();
  const activity = buildRecentActivity();
  const health = buildHealthSummary();

  const displayName = user?.nome ?? user?.usuario ?? "Operador";
  const tenantLabel = cliente?.nome ?? cliente?.codigo ?? "sua organização";

  return (
    <div className="bos-home">
      <section className="bos-hero" aria-labelledby="bos-hero-title">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-sky-200">
          Business Operating System
        </p>
        <h1 id="bos-hero-title" className="bos-hero-title">
          Bem-vindo, {displayName}
        </h1>
        <p className="bos-hero-subtitle">
          Administre objetivos, capacidades e ativos de {tenantLabel}. Esta é a superfície oficial de
          operação de negócio — não um menu de módulos ERP.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild size="sm" className="bg-white text-slate-900 hover:bg-slate-100">
            <Link to="/bos/business-first">Criar por intenção</Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
            <Link to="#capabilities">Ver capacidades</Link>
          </Button>
        </div>
      </section>

      <RecommendationsSection recommendations={recommendations} />

      <ObjectivesSection objectives={objectives} />

      <AuthoringEntryPanel entries={BOS_AUTHORING_ENTRIES} />

      <section id="capabilities" className="bos-section" aria-labelledby="bos-capabilities-title">
        <div className="bos-section-heading">
          <h2 id="bos-capabilities-title" className="bos-section-title">
            Capacidades de negócio
          </h2>
          <p className="bos-section-subtitle">
            Funções que você habilita — cada operação abre a projeção de runtime necessária.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability) => (
            <CapabilityCard key={capability.capabilityId} capability={capability} />
          ))}
        </div>
      </section>

      <section id="assets" className="bos-section" aria-labelledby="bos-assets-title">
        <div className="bos-section-heading">
          <h2 id="bos-assets-title" className="bos-section-title">
            Ativos reutilizáveis
          </h2>
          <p className="bos-section-subtitle">
            Unidade central de valor — regras, indicadores e processos como ativos de negócio.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {assetTypes.map((assetType) => (
            <AssetCard key={assetType.assetType} assetType={assetType} />
          ))}
        </div>
      </section>

      <section id="operations" className="bos-section" aria-labelledby="bos-operations-title">
        <div className="bos-section-heading">
          <h2 id="bos-operations-title" className="bos-section-title">
            Operações do dia a dia
          </h2>
          <p className="bos-section-subtitle">
            Filas de trabalho em linguagem humana — cadastros permanecem como projeções, não como identidade.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {capabilities
            .filter((cap) => cap.category === "operations")
            .map((capability) => (
              <Link
                key={capability.capabilityId}
                to={capability.operationRoute}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-sky-300 hover:bg-sky-50/40"
              >
                <span className="font-medium text-slate-900">{capability.label}</span>
                <span className="text-xs text-sky-700">Abrir →</span>
              </Link>
            ))}
        </div>
      </section>

      <HealthSummarySection health={health} />
      <ActivityTeaserSection items={activity} />
    </div>
  );
}
