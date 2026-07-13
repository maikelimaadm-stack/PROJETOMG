# Module Risk Plan

`createModuleRiskPlan` registra os riscos, cada um com mitigação que mantém o slice
contract-only.

| Risco | Mitigação | Severidade |
| --- | --- | --- |
| planner confundido com gerador | moduleGenerated=false; generationAllowedNow=false | high |
| criar arquivos em src/modules cedo | file plan plannedOnly; gate bloqueia src/modules | high |
| route/menu ativados cedo | routeCreated/menuCreated=false; dev/flag/permission gated | high |
| backend/Prisma como execução | futureOnly; allowedNow=false | high |
| persistence sem readiness | realPersistenceBlocked=true | high |
| permission aberta | defaultDeny/failClosed; só read | high |
| tenant bypass | tenantRequired=true; admin não contorna | high |
| módulo antes do registry | readyForRealModuleGeneration=false; needs_registry | medium |
| preview vira produção | preview futureOnly; productionAllowed=false | medium |
| Empresas reescrita | rewriteEmpresas=false; referenceOnly | high |
| ModeloBase2 vira produção | modeloBase2IsProduction=false | medium |
| marketplace antes do registry | needs_registry primeiro | low |
