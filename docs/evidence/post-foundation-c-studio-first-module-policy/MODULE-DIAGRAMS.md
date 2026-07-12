# Module Diagrams — Studio-First Module Policy & Experimental Base Reconciliation

## Diagrama 1 — Blocos atuais e limites

```mermaid
flowchart TD
  MAK[MAK Gestão Atual] --> MB1[ModeloBase1]
  MB1 --> EMP[Empresas]
  MB1 --> CAD[cadcps]
  MAK --> MB2[ModeloBase2 Experimental]
  MB2 --> FUEL[Fuel Sandbox]
  FUEL -. não produção .-> DP[Dev Preview]
  FUEL -. não registra .-> MODS[src/modules]
  FUEL -. não aparece .-> MENU[Menu]
```

## Diagrama 2 — Empresas como laboratório real controlado

```mermaid
flowchart TD
  EMP[Empresas] --> POL[Production Lab Policy]
  POL --> FB[Future Backend Pilot]
  POL --> FP[Future Prisma Pilot]
  POL --> FPP[Future Persistence Pilot]
  EMP -. com gates .-> CPT[Controlled Production Test]
```

## Diagrama 3 — Política Studio-first

```mermaid
flowchart TD
  SFP[Studio First Policy] -. bloqueia .-> FCR[Fuel Controlled Registration]
  SFP -. bloqueia .-> PES[Pesagem Real]
  SFP -. bloqueia .-> APO[Apontamento Real]
  SFP --> SF[Studio Foundation Future]
  SF --> MB[Module Blueprint Future]
  MB --> FM[Future Modules]
  FM --> SGM[Studio Generated Modules]
```

## Leitura

- **Produção** flui por ModeloBase1 → Empresas / cadcps.
- **Experimental** flui por ModeloBase2 → Fuel Sandbox, sem tocar produção (arestas tracejadas).
- **Empresas** é o único caminho autorizado para pilotos reais de backend/Prisma/persistência,
  sempre atrás de gates e slices explícitos.
- **Studio First Policy** bloqueia registro real até Studio Foundation + Module Blueprint
  amadurecerem; a partir daí, módulos futuros nascem gerados pelo Studio.
