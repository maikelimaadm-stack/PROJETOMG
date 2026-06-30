import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  listWorkflowTasks,
  applyWorkflowTaskAction,
  seedDemoWorkflowTasks,
} from "@/studio/business/workflow/businessWorkflowTaskInbox.js";

export default function WorkflowInboxPage() {
  const { cliente } = useAuth();
  const tenantId = String(cliente?.id ?? "default");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    seedDemoWorkflowTasks(tenantId);
    setTasks(listWorkflowTasks(tenantId));
  }, [tenantId]);

  const pending = useMemo(
    () => tasks.filter((t) => !["aprovado", "rejeitado", "concluido"].includes(t.stateId)),
    [tasks]
  );

  const handleAction = (taskId, action) => {
    applyWorkflowTaskAction(taskId, action);
    setTasks(listWorkflowTasks(tenantId));
  };

  return (
    <div className="bos-page">
      <Link to="/" className="text-xs text-sky-700 hover:underline">
        ← Voltar ao Business OS
      </Link>
      <h1 className="bos-page-title mt-4">Pendências e aprovações</h1>
      <p className="bos-page-lead">
        Caixa operacional de negócio — estados, responsáveis e prazos em linguagem humana. Sem BPMN, sem
        motores técnicos.
      </p>

      <div className="mt-6 space-y-3">
        {pending.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="py-6 text-sm text-slate-600">Nenhuma pendência no momento.</CardContent>
          </Card>
        ) : (
          pending.map((task) => (
            <Card key={task.taskId} className="border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold">{task.workflowTitle}</CardTitle>
                  <Badge variant="outline">{task.stateLabel}</Badge>
                </div>
                <CardDescription className="text-xs leading-relaxed">{task.explainability}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-0">
                <Button size="sm" onClick={() => handleAction(task.taskId, "approve")}>
                  Aprovar
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAction(task.taskId, "return")}>
                  Retornar para correção
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAction(task.taskId, "reject")}>
                  Rejeitar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleAction(task.taskId, "escalate")}>
                  Escalar
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
