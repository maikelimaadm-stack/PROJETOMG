import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Sparkles, Wrench } from "lucide-react";

export function AuthoringEntryPanel({ entries }) {
  return (
    <section className="bos-section" aria-labelledby="bos-authoring-title">
      <div className="bos-section-heading">
        <h2 id="bos-authoring-title" className="bos-section-title">
          Criação de ativos
        </h2>
        <p className="bos-section-subtitle">Business First por padrão — especialista apenas quando necessário.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((entry) => {
          const isDefault = entry.mode === "default";
          const Icon = isDefault ? Sparkles : Wrench;
          return (
            <Card
              key={entry.id}
              className={`bos-card border-slate-200/80 ${isDefault ? "ring-1 ring-sky-200" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <CardTitle className="text-sm font-semibold text-slate-900">{entry.label}</CardTitle>
                <CardDescription className="text-xs text-slate-600">{entry.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild size="sm" variant={isDefault ? "default" : "outline"} className="w-full">
                  <Link to={entry.route}>{isDefault ? "Começar" : "Entrar com controle"}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default AuthoringEntryPanel;
