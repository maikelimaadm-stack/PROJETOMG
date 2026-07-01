import { Link } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
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
import {
  MemoryOperationalSummarySection,
  MemoryDecisionsSection,
  MemoryWorkflowsSection,
  MemoryWhySection,
} from "@/bos/components/MemorySections";
import {
  KnowledgeRelationsSection,
  KnowledgeDecisionLinksSection,
  KnowledgeContextShortcutsSection,
  KnowledgeWhyRelatedSection,
} from "@/bos/components/KnowledgeSections";
import {
  ConsultingOpportunitiesSection,
  ConsultingRecommendationsSection,
  ConsultingPlansSection,
  ConsultingEvidenceSection,
} from "@/bos/components/ConsultingSections";
import {
  DecisionPendingSection,
  DecisionAlternativesSection,
  DecisionScenariosSection,
  DecisionEvidenceSection,
  DecisionWhySection,
} from "@/bos/components/DecisionSections";
import {
  EvolutionTimelineSection,
  EvolutionMaturitySection,
  EvolutionProgressSection,
  EvolutionMilestonesSection,
  EvolutionWhySection,
} from "@/bos/components/EvolutionSections";
import {
  BusinessDnaIdentitySection,
  BusinessDnaFingerprintSection,
  BusinessDnaMaturitySection,
  BusinessDnaPatternsSection,
  BusinessDnaMilestonesSection,
  BusinessDnaGrowthSignalsSection,
  BusinessDnaPortfolioSection,
} from "@/bos/components/BusinessDnaSections";
import {
  SegmentationProfileSection,
  CompatibleTemplatesSection,
  AdvancedMaturitySection,
  SegmentationBenchmarksSection,
  AccelerationSuggestionsSection,
  SegmentationGroupSection,
} from "@/bos/components/BusinessSegmentationSections";
import {
  PriorityRecommendationsSection,
  SuggestedPlansSection,
  ReplicablePracticesSection,
  RecommendationWhySection,
} from "@/bos/components/BusinessRecommendationSections";
import {
  AdoptedRecommendationsSection,
  RejectedRecommendationsSection,
  AdoptionProgressSection,
  AdoptionImpactSection,
  CorporateIntelligenceSection,
} from "@/bos/components/BusinessAdoptionSections";
import {
  ImprovementCyclesSection,
  OptimizationOpportunitiesSection,
  ImprovementImpactSection,
  OperationalFeedbackLoopSection,
} from "@/bos/components/BusinessImprovementSections";
import {
  PortfolioCommandCenterSection,
  MultiCompanyHealthSection,
  PortfolioRankingsSection,
  PortfolioTrendsSection,
  PortfolioReferencesSection,
  PortfolioAlertsSection,
} from "@/bos/components/BusinessPortfolioSections";
import {
  GovernanceControlCenterSection,
  PortfolioControlCenterSection,
  AuthorizedGroupScopesSection,
  GovernancePoliciesSection,
  RetentionComplianceSection,
  GovernanceAuditSection,
} from "@/bos/components/BusinessGovernanceSections";
import {
  FortressComplianceSection,
  FortressRetentionSection,
  FortressAuditSection,
  FortressExposureSection,
} from "@/bos/components/BusinessFortressSections";
import {
  LifecycleStatusSection,
  LifecycleArchiveHoldSection,
  LifecycleApprovalSection,
  LifecycleAuditSection,
  LifecycleControlCenterSection,
} from "@/bos/components/BusinessLifecycleSections";
import { useAuth } from "@/shared/contexts/AuthContext";
import {
  buildIntelligenceHomeProjection,
} from "@/intelligence/integration/bosIntelligenceProjection.js";
import { findAuthorizedGroupIdForTenant } from "@/intelligence/dna/engine/businessDnaStore.js";
import { captureBosHomeViewed } from "@/intelligence/integration/intelligenceEventBridge.js";
import {
  approvePersistentLifecycleRequest,
  rejectPersistentLifecycleRequest,
} from "@/intelligence/lifecycle/persistence/lifecyclePersistenceActions.js";

export default function BosHomePage() {
  const { user, cliente } = useAuth();
  const tenantId = String(cliente?.id ?? "default");
  const groupId = findAuthorizedGroupIdForTenant(tenantId);

  const [lifecycleRefresh, setLifecycleRefresh] = useState(0);

  useEffect(() => {
    captureBosHomeViewed(tenantId, user?.usuario ?? "business-user");
  }, [tenantId, user?.usuario]);

  const intelligence = useMemo(
    () => buildIntelligenceHomeProjection(tenantId, groupId ? { groupId } : {}),
    [tenantId, groupId, lifecycleRefresh]
  );

  const handleApproveLifecycle = useCallback(
    (requestId) => {
      approvePersistentLifecycleRequest(requestId, user?.usuario ?? "administrador");
      setLifecycleRefresh((n) => n + 1);
    },
    [user?.usuario]
  );

  const handleRejectLifecycle = useCallback(
    (requestId) => {
      rejectPersistentLifecycleRequest(
        requestId,
        user?.usuario ?? "administrador",
        "Rejeitado pelo administrador no BOS."
      );
      setLifecycleRefresh((n) => n + 1);
    },
    [user?.usuario]
  );

  const capabilities = buildBosCapabilities();
  const assetTypes = buildBosAssetTypes();
  const objectives = buildDefaultObjectives();
  const recommendations = buildExplainableSuggestions();
  const activity = intelligence.activity ?? buildRecentActivity();
  const health = intelligence.hasMemory || intelligence.hasObservations ? intelligence.health : buildHealthSummary();

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
            <Link to="/bos/workflow/inbox">Pendências</Link>
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

      <MemoryOperationalSummarySection
        summary={intelligence.operationalSummary}
        evolutionSignal={intelligence.evolutionSignal}
      />
      <MemoryDecisionsSection decisions={intelligence.recentDecisions} />
      <MemoryWorkflowsSection workflows={intelligence.recentWorkflows} />
      <MemoryWhySection
        highlights={intelligence.whyHighlights}
        replayTeaser={intelligence.replayTeaser}
      />

      <KnowledgeRelationsSection
        summary={intelligence.knowledgeSummary}
        relations={intelligence.knowledgeRelations}
      />
      <KnowledgeDecisionLinksSection links={intelligence.decisionOutcomeLinks} />
      <KnowledgeContextShortcutsSection shortcuts={intelligence.contextShortcuts} />
      <KnowledgeWhyRelatedSection highlights={intelligence.whyRelated} />

      <ConsultingOpportunitiesSection
        summary={intelligence.consultingSummary}
        opportunities={intelligence.consultingOpportunities}
      />
      <ConsultingRecommendationsSection
        recommendations={intelligence.consultingRecommendations}
        priorities={intelligence.consultingPriorities}
      />
      <ConsultingPlansSection
        plans={intelligence.consultingPlans}
        evolutionTracking={intelligence.consultingEvolutionTracking}
      />
      <ConsultingEvidenceSection highlights={intelligence.consultingEvidence} />

      <DecisionPendingSection
        summary={intelligence.decisionSummary}
        decisions={intelligence.decisionPending}
        nextAction={intelligence.decisionNextAction}
      />
      <DecisionAlternativesSection alternatives={intelligence.decisionAlternatives} />
      <DecisionScenariosSection scenarios={intelligence.decisionScenarios} />
      <DecisionWhySection highlights={intelligence.decisionWhyImportant} />
      <DecisionEvidenceSection
        highlights={intelligence.decisionEvidence}
        history={intelligence.decisionHistory}
      />

      <EvolutionTimelineSection
        summary={intelligence.evolutionSummary}
        timeline={intelligence.evolutionTimeline}
      />
      <EvolutionMaturitySection
        maturityLevel={intelligence.evolutionMaturity}
        capabilities={intelligence.evolutionMaturityByCapability}
      />
      <EvolutionProgressSection
        plans={intelligence.evolutionPlans}
        progressSummary={intelligence.evolutionProgressSummary}
        nextSteps={intelligence.evolutionNextSteps}
      />
      <EvolutionMilestonesSection
        milestones={intelligence.evolutionMilestones}
        suggestedPaths={intelligence.evolutionSuggestedPaths}
      />
      <EvolutionWhySection
        highlights={intelligence.evolutionWhyRecommended}
        periodComparison={intelligence.evolutionPeriodComparison}
        decisionImpact={intelligence.evolutionDecisionImpact}
      />

      <BusinessDnaIdentitySection
        headline={intelligence.dnaIdentityHeadline}
        narrative={intelligence.dnaIdentityNarrative}
        whoIsThisCompany={intelligence.dnaWhoIsThisCompany}
        howThisCompanyWorks={intelligence.dnaHowThisCompanyWorks}
      />
      <BusinessDnaFingerprintSection
        traits={intelligence.dnaFingerprintTraits}
        label={intelligence.dnaFingerprintLabel}
      />
      <BusinessDnaMaturitySection
        maturityLevel={intelligence.dnaMaturityLevel}
        capabilities={intelligence.dnaMaturityByCapability}
        whereMatured={intelligence.dnaWhereMatured}
        whereNeedsEvolution={intelligence.dnaWhereNeedsEvolution}
      />
      <BusinessDnaPatternsSection
        operational={intelligence.dnaOperationalPatterns}
        cultural={intelligence.dnaCulturalPatterns}
      />
      <BusinessDnaMilestonesSection milestones={intelligence.dnaMilestones} />
      <BusinessDnaGrowthSignalsSection signals={intelligence.dnaGrowthSignals} />
      <BusinessDnaPortfolioSection portfolio={intelligence.dnaPortfolio} />

      <SegmentationProfileSection
        segmentLabel={intelligence.segmentLabel}
        narrative={intelligence.segmentNarrative}
        summary={intelligence.segmentationSummary}
      />
      <CompatibleTemplatesSection
        templates={intelligence.compatibleTemplates}
        headline={intelligence.templateHeadline}
      />
      <AdvancedMaturitySection
        score={intelligence.advancedMaturityScore}
        radar={intelligence.segmentationMaturityRadar}
        priorityCapabilities={intelligence.segmentationPriorityCapabilities}
        progress={intelligence.maturityProgress}
      />
      <SegmentationBenchmarksSection benchmarks={intelligence.segmentationBenchmarks} />
      <AccelerationSuggestionsSection suggestions={intelligence.accelerationSuggestions} />
      <SegmentationGroupSection
        groupComparison={intelligence.segmentationGroupComparison}
        patternSuggestions={intelligence.corporatePatternSuggestions}
      />

      <PriorityRecommendationsSection
        recommendations={intelligence.priorityRecommendations}
        summary={intelligence.recommendationSummary}
      />
      <SuggestedPlansSection plans={intelligence.suggestedImprovementPlans} />
      <ReplicablePracticesSection
        practices={intelligence.replicablePractices}
        summary={intelligence.replicationSummary}
      />
      <RecommendationWhySection
        highlights={intelligence.recommendationWhy}
        nextSteps={intelligence.recommendationNextSteps}
      />

      <AdoptedRecommendationsSection
        adoptions={intelligence.adoptedRecommendations}
        summary={intelligence.adoptionSummary}
      />
      <RejectedRecommendationsSection rejections={intelligence.rejectedRecommendations} />
      <AdoptionProgressSection
        progressPercent={intelligence.adoptionProgressPercent}
        milestones={intelligence.adoptionMilestones}
        plans={intelligence.adoptionPlansInProgress}
      />
      <AdoptionImpactSection
        validatedOutcomes={intelligence.adoptionValidatedOutcomes}
        pendingValidation={intelligence.adoptionPendingValidation}
      />
      <CorporateIntelligenceSection
        corporateView={intelligence.corporateView}
        benchmarks={intelligence.corporateBenchmarks}
        references={intelligence.corporateReferences}
        variances={intelligence.corporateVariances}
        opportunities={intelligence.corporateOpportunities}
        companyComparisons={intelligence.corporateCompanyComparisons}
        groupInsights={intelligence.corporateGroupInsights}
        summary={intelligence.corporateSummary}
        healthScore={intelligence.corporateHealthScore}
      />

      <ImprovementCyclesSection
        cycles={intelligence.activeImprovementCycles}
        summary={intelligence.improvementSummary}
      />
      <OptimizationOpportunitiesSection
        opportunities={intelligence.optimizationOpportunities}
        summary={intelligence.optimizationSummary}
      />
      <ImprovementImpactSection
        validated={intelligence.validatedImprovements}
        pending={intelligence.pendingEffectImprovements}
        accumulatedImpact={intelligence.accumulatedImprovementImpact}
      />
      <OperationalFeedbackLoopSection
        feedbackLoop={intelligence.operationalFeedbackLoop}
        patterns={intelligence.recurringImprovementPatterns}
        benchmarks={[...(intelligence.improvementBenchmarks ?? []), ...(intelligence.optimizationBenchmarks ?? [])]}
      />

      <PortfolioCommandCenterSection
        commandCenter={intelligence.portfolioCommandCenter}
        summary={intelligence.portfolioSummary}
        healthScore={intelligence.portfolioCommandCenter?.healthScore}
        belowStandardCount={intelligence.portfolioBelowStandardCount}
        aboveStandardCount={intelligence.portfolioAboveStandardCount}
      />
      <MultiCompanyHealthSection
        companies={intelligence.portfolioCompanyHealth}
        benchmarks={intelligence.portfolioBenchmarks}
      />
      <PortfolioRankingsSection
        rankings={intelligence.portfolioRankings}
        leader={intelligence.portfolioLeaderCompany}
      />
      <PortfolioTrendsSection
        trends={intelligence.portfolioTrends}
        evolutionTimeline={intelligence.groupEvolutionTimeline}
      />
      <PortfolioReferencesSection
        references={intelligence.portfolioReferences}
        variances={intelligence.portfolioVariances}
        opportunities={intelligence.portfolioOpportunities}
      />
      <PortfolioAlertsSection
        alerts={intelligence.portfolioAlerts}
        standardization={intelligence.corporateStandardization}
        capabilityRadar={intelligence.groupCapabilityRadar}
      />

      <GovernanceControlCenterSection
        controlCenter={intelligence.governanceControlCenter}
        summary={intelligence.governanceSummary}
        complianceStatus={intelligence.complianceStatus}
      />
      <PortfolioControlCenterSection portfolioControl={intelligence.portfolioControlCenter} />
      <AuthorizedGroupScopesSection scopes={intelligence.authorizedGroupScopes} />
      <GovernancePoliciesSection
        policies={intelligence.activePolicies}
        permissions={intelligence.governancePermissions}
      />
      <RetentionComplianceSection
        retentions={intelligence.retentionPolicies}
        compliance={intelligence.complianceStatus}
      />
      <GovernanceAuditSection
        auditHistory={intelligence.auditHistory}
        alerts={intelligence.governanceAlerts}
        visibilityZones={intelligence.visibilityZones}
      />

      <FortressComplianceSection
        complianceStatus={intelligence.fortressComplianceStatus}
        rules={intelligence.activeComplianceRules}
        summary={intelligence.fortressSummary}
      />
      <FortressRetentionSection
        retentionByType={intelligence.retentionByType}
        archivedData={intelligence.archivedData}
        legalHolds={intelligence.legalHolds}
      />
      <FortressAuditSection
        auditedEvents={intelligence.auditedEvents}
        exceptions={intelligence.registeredExceptions}
        purgeSummary={intelligence.purgeSummary}
      />
      <FortressExposureSection
        exposureBlocks={intelligence.exposureBlocks}
        alerts={intelligence.fortressAlerts}
        tenantCompliance={intelligence.tenantComplianceView}
      />

      <LifecycleStatusSection
        lifecycleStatus={intelligence.lifecycleStatusView}
        lifecycleByType={intelligence.lifecycleByType}
        summary={intelligence.lifecycleSummary}
      />
      <LifecycleArchiveHoldSection
        archivedRecords={intelligence.lifecycleArchivedRecords}
        legalHolds={intelligence.lifecycleLegalHolds}
        retentionPolicies={intelligence.lifecycleRetentionPolicies}
      />
      <LifecycleApprovalSection
        pendingApprovals={
          intelligence.lifecyclePersistencePendingApprovals?.length
            ? intelligence.lifecyclePersistencePendingApprovals
            : intelligence.lifecyclePendingApprovals
        }
        expungeableRecords={intelligence.lifecycleExpungeableRecords}
        blockReasons={
          intelligence.lifecyclePersistenceBlockReasons?.length
            ? intelligence.lifecyclePersistenceBlockReasons
            : intelligence.lifecycleBlockReasons
        }
        approvedActions={intelligence.lifecyclePersistenceApprovedActions}
        rejectedActions={intelligence.lifecyclePersistenceRejectedActions}
        onApprove={handleApproveLifecycle}
        onReject={handleRejectLifecycle}
      />
      <LifecycleAuditSection
        lifecycleHistory={intelligence.lifecycleHistory}
        auditTrailByDocument={intelligence.lifecycleAuditTrail}
        expirationAlerts={intelligence.lifecycleExpirationAlerts}
        durableAuditTrail={intelligence.lifecyclePersistenceDurableAudit}
        executionQueue={intelligence.lifecyclePersistenceExecutionQueue}
      />
      <LifecycleControlCenterSection
        controlCenter={
          intelligence.lifecyclePersistenceControlCenter ?? intelligence.lifecycleControlCenter
        }
        dataStates={intelligence.lifecycleDataStates}
      />

      <ActivityTeaserSection items={activity} />
    </div>
  );
}
