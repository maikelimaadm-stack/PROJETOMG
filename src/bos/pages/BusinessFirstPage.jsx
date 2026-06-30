import { useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  createBusinessLanguageInput,
  resolveFromBusinessLanguage,
} from "@/studio/intent/index.js";
import { useAuth } from "@/shared/contexts/AuthContext";

export default function BusinessFirstPage() {
  const { user, cliente } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const assetHint = searchParams.get("asset");
  const blocked = searchParams.get("blocked");

  const [objective, setObjective] = useState("");
  const [condition, setCondition] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const blockedMessage = useMemo(() => {
    if (blocked === "formula") {
      return location.state?.message ??
        "Formula Builder não faz parte da experiência de negócio. Descreva sua regra aqui.";
    }
    return null;
  }, [blocked, location.state]);

  const handlePreview = () => {
    setError(null);
    try {
      const input = createBusinessLanguageInput({
        objective: objective.trim() || "Regra de negócio",
        condition: condition.trim() || null,
        expectedResult: expectedResult.trim(),
        tenantId: String(cliente?.id ?? "default"),
        authoredBy: user?.usuario ?? "business-user",
        computation: {
          expressionSource: expectedResult.trim() || "0",
          ownerFieldId: "preview-field",
          moduleId: "empresas",
          entityId: "empresa",
          fieldKind: "computed",
        },
      });

      const result = resolveFromBusinessLanguage(input, {
        preview: true,
        initiatedBy: user?.usuario ?? "business-user",
      });

      if (!result.ok) {
        const message =
          result.diagnostics?.map((d) => d.message).join(" ") ??
          "Não foi possível interpretar a intenção.";
        setError(message);
        setPreview(null);
        return;
      }

      setPreview({
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

  return (
    <div className="bos-page">
      <Link to="/" className="text-xs text-sky-700 hover:underline">
        ← Voltar ao início
      </Link>

      <h1 className="bos-page-title mt-4">Criar por intenção</h1>
      <p className="bos-page-lead">
        Business First — descreva o que você precisa em linguagem de negócio. O sistema converte para
        Intent e Business Asset sem expor fórmulas, AST ou engines.
      </p>

      {blockedMessage ? <div className="bos-notice">{blockedMessage}</div> : null}

      {assetHint === "computed_field" ? (
        <Card className="mt-4 border-sky-200 bg-sky-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Campo Calculado</CardTitle>
            <CardDescription className="text-xs">
              Ativo certificado (G306) — primeira criação disponível via Business Language.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="bos-form-grid">
        <label className="bos-label">
          Objetivo de negócio
          <input
            className="bos-input"
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            placeholder="Ex.: Calcular total com impostos inclusos"
          />
        </label>
        <label className="bos-label">
          Condição (quando aplicar)
          <input
            className="bos-input"
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            placeholder="Ex.: Quando o pedido estiver confirmado"
          />
        </label>
        <label className="bos-label">
          Resultado esperado
          <textarea
            className="bos-textarea"
            value={expectedResult}
            onChange={(event) => setExpectedResult(event.target.value)}
            placeholder="Ex.: O total deve incluir ICMS e descontos comerciais acordados"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={handlePreview}>
          Pré-visualizar intenção
        </Button>
        <Button asChild type="button" variant="outline">
          <Link to="/">Cancelar</Link>
        </Button>
      </div>

      {error ? <div className="bos-notice mt-4">{error}</div> : null}

      {preview ? (
        <div className="bos-preview-box">
          <p className="font-medium text-slate-900">Pré-visualização explicável</p>
          <p className="mt-2">
            <span className="font-medium">Intenção:</span> {preview.intentPhrase}
          </p>
          <p className="mt-1">
            <span className="font-medium">Tipo de ativo:</span> {preview.assetType}
          </p>
          <p className="mt-1">
            <span className="font-medium">Explicação:</span> {preview.explainability}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Confirmação humana e persistência completas serão habilitadas na próxima fase de implementação.
          </p>
        </div>
      ) : null}
    </div>
  );
}
