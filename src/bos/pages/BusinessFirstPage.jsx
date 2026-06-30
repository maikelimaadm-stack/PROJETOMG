import { useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  createBusinessLanguageInput,
  resolveFromBusinessLanguage,
} from "@/studio/intent/index.js";
import { saveWorkflowTask, createWorkflowTask } from "@/studio/business/workflow/businessWorkflowTaskInbox.js";
import { useAuth } from "@/shared/contexts/AuthContext";

export default function BusinessFirstPage() {
  const { user, cliente } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const assetHint = searchParams.get("asset") ?? "computed_field";
  const isWorkflow = assetHint === "workflow";
  const blocked = searchParams.get("blocked");

  const [objective, setObjective] = useState("");
  const [condition, setCondition] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [processDescription, setProcessDescription] = useState("");
  const [approverLabel, setApproverLabel] = useState("Aprovador responsável");
  const [slaHours, setSlaHours] = useState("48");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const blockedMessage = useMemo(() => {
    if (blocked === "formula") {
      return location.state?.message ??
        "Formula Builder não faz parte da experiência de negócio. Descreva seu processo aqui.";
    }
    return null;
  }, [blocked, location.state]);

  const buildInput = () => {
    const tenantId = String(cliente?.id ?? "default");
    const authoredBy = user?.usuario ?? "business-user";

    if (isWorkflow) {
      return createBusinessLanguageInput({
        assetKind: "workflow",
        objective: objective.trim() || "Fluxo de aprovação",
        processDescription: processDescription.trim() || expectedResult.trim(),
        condition: condition.trim() || null,
        expectedResult: expectedResult.trim(),
        approvers: [{ role: "aprovador", label: approverLabel.trim() || "Aprovador responsável" }],
        process: {
          processId: "approval-process",
          moduleId: "empresas",
          entityId: "operacao",
          slaHours: Number(slaHours) || 48,
          escalationRole: "supervisor",
        },
        tenantId,
        authoredBy,
      });
    }

    return createBusinessLanguageInput({
      objective: objective.trim() || "Regra de negócio",
      condition: condition.trim() || null,
      expectedResult: expectedResult.trim(),
      tenantId,
      authoredBy,
      computation: {
        expressionSource: expectedResult.trim() || "0",
        ownerFieldId: "preview-field",
        moduleId: "empresas",
        entityId: "empresa",
        fieldKind: "computed",
      },
    });
  };

  const handlePreview = () => {
    setError(null);
    setSaved(false);
    try {
      const input = buildInput();
      const result = resolveFromBusinessLanguage(input, {
        preview: true,
        initiatedBy: user?.usuario ?? "business-user",
      });

      if (!result.ok) {
        setError(
          result.diagnostics?.map((d) => d.message).join(" ") ??
            "Não foi possível interpretar a intenção."
        );
        setPreview(null);
        return;
      }

      if (isWorkflow && result.businessWorkflow) {
        setPreview({
          mode: "workflow",
          intentPhrase: result.intentDocument?.intentPhrase ?? objective,
          assetType: "business.asset.workflow",
          states: result.businessWorkflow.states?.map((s) => s.label).join(" → "),
          approvers: result.businessWorkflow.assignments?.map((a) => a.label).join(", "),
          sla: result.businessWorkflow.sla?.label,
          explainability: result.businessExplainability?.businessSummary ?? result.explainability?.businessSummary,
          workflowId: result.businessWorkflow.id,
        });
        return;
      }

      setPreview({
        mode: "computed_field",
        intentPhrase: result.intentDocument?.intentPhrase ?? objective,
        assetType: result.businessComputedField?.assetType ?? "business.asset.computed_field",
        explainability:
          result.explainability?.businessSummary ??
          result.businessExplainability?.summary ??
          "Intenção interpretada com sucesso.",
      });
    } catch (previewError) {
      setPreview(null);
      setError(previewError?.message ?? "Não foi possível interpretar a intenção.");
    }
  };

  const handleConfirm = () => {
    if (!preview || preview.mode !== "workflow") return;
    const tenantId = String(cliente?.id ?? "default");
    saveWorkflowTask(
      createWorkflowTask({
        workflowId: preview.workflowId,
        workflowTitle: objective.trim() || "Fluxo de aprovação",
        tenantId,
        explainability: preview.explainability ?? preview.intentPhrase,
      })
    );
    setSaved(true);
  };

  return (
    <div className="bos-page">
      <Link to="/" className="text-xs text-sky-700 hover:underline">
        ← Voltar ao início
      </Link>

      <h1 className="bos-page-title mt-4">Criar por intenção</h1>
      <p className="bos-page-lead">
        Business First — descreva o processo ou regra em linguagem de negócio. Sem BPMN, sem desenho
        técnico, sem motores expostos.
      </p>

      {blockedMessage ? <div className="bos-notice">{blockedMessage}</div> : null}

      {isWorkflow ? (
        <Card className="mt-4 border-violet-200 bg-violet-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fluxo de Aprovação</CardTitle>
            <CardDescription className="text-xs">
              Business Workflow (G308) — estados, responsáveis e prazos em vocabulário de negócio.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="mt-4 border-sky-200 bg-sky-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Campo Calculado</CardTitle>
            <CardDescription className="text-xs">Business Computed Field certificado (G306).</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="bos-form-grid">
        <label className="bos-label">
          Objetivo de negócio
          <input
            className="bos-input"
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            placeholder={isWorkflow ? "Ex.: Aprovar pedidos de compra" : "Ex.: Calcular total com impostos inclusos"}
          />
        </label>
        {isWorkflow ? (
          <label className="bos-label">
            Descrição do processo
            <textarea
              className="bos-textarea"
              value={processDescription}
              onChange={(event) => setProcessDescription(event.target.value)}
              placeholder="Ex.: Compras acima de R$ 5.000 precisam de aprovação do responsável financeiro"
            />
          </label>
        ) : null}
        <label className="bos-label">
          Condição (quando aplicar)
          <input
            className="bos-input"
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            placeholder="Ex.: Quando o valor exceder o limite definido"
          />
        </label>
        {isWorkflow ? (
          <>
            <label className="bos-label">
              Responsável pela aprovação
              <input
                className="bos-input"
                value={approverLabel}
                onChange={(event) => setApproverLabel(event.target.value)}
                placeholder="Ex.: Gerente financeiro"
              />
            </label>
            <label className="bos-label">
              Prazo (horas úteis)
              <input
                className="bos-input"
                type="number"
                min="1"
                value={slaHours}
                onChange={(event) => setSlaHours(event.target.value)}
              />
            </label>
          </>
        ) : null}
        <label className="bos-label">
          Resultado esperado
          <textarea
            className="bos-textarea"
            value={expectedResult}
            onChange={(event) => setExpectedResult(event.target.value)}
            placeholder={
              isWorkflow
                ? "Ex.: Pedido aprovado ou retornado para correção com explicação"
                : "Ex.: O total deve incluir impostos e descontos acordados"
            }
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={handlePreview}>
          Pré-visualizar intenção
        </Button>
        {preview?.mode === "workflow" ? (
          <Button type="button" variant="secondary" onClick={handleConfirm}>
            Confirmar e registrar operação
          </Button>
        ) : null}
        <Button asChild type="button" variant="outline">
          <Link to="/">Cancelar</Link>
        </Button>
      </div>

      {error ? <div className="bos-notice mt-4">{error}</div> : null}
      {saved ? (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          Workflow registrado.{" "}
          <Link to="/bos/workflow/inbox" className="font-medium underline">
            Ver pendências
          </Link>
        </div>
      ) : null}

      {preview ? (
        <div className="bos-preview-box">
          <p className="font-medium text-slate-900">Pré-visualização explicável</p>
          <p className="mt-2">
            <span className="font-medium">Intenção:</span> {preview.intentPhrase}
          </p>
          <p className="mt-1">
            <span className="font-medium">Tipo de ativo:</span> {preview.assetType}
          </p>
          {preview.mode === "workflow" ? (
            <>
              <p className="mt-1">
                <span className="font-medium">Estados:</span> {preview.states}
              </p>
              <p className="mt-1">
                <span className="font-medium">Responsáveis:</span> {preview.approvers}
              </p>
              <p className="mt-1">
                <span className="font-medium">Prazo:</span> {preview.sla}
              </p>
            </>
          ) : null}
          <p className="mt-1">
            <span className="font-medium">Explicação:</span> {preview.explainability}
          </p>
        </div>
      ) : null}
    </div>
  );
}
