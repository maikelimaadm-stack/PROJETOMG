# Module Diagrams — Studio Foundation Audit

## Diagrama 1 — Fundação → blueprints

```mermaid
flowchart TD
  SF[Studio Foundation] --> MM[Metamodel]
  MM --> MB[Module Blueprint]
  MB --> FB[Field Blueprint]
  MB --> SB[Screen Blueprint]
  MB --> VB[Validation Blueprint]
  MB --> PB[Permission Blueprint]
  MB --> RM[Route Menu Blueprint]
  MB --> PBd[Persistence Boundary]
  MB --> RB[Runtime Binding]
```

## Diagrama 2 — Fontes da fundação

```mermaid
flowchart TD
  EC[Empresas Certified Contract] --> SF[Studio Foundation]
  MB1[ModeloBase1] --> SF
  MB2[ModeloBase2 Experimental] --> SF
  CAD[cadcps] --> SF
  SF --> FMB[Future Module Blueprint]
```

## Diagrama 3 — O que o blueprint NÃO faz automaticamente

```mermaid
flowchart TD
  SB[Studio Blueprint] -. não cria automaticamente .-> PR[Production Route]
  SB -. não aparece automaticamente .-> MENU[Menu]
  SB -. não cria automaticamente .-> PS[Prisma Schema]
  SB -. não executa .-> MG[Migration]
  SB -. não altera .-> EMP[Empresas]
```

## Diagrama 4 — Roadmap

```mermaid
flowchart TD
  SFC[Studio Foundation Contracts] --> FSS[Future Studio Sandbox]
  FSS --> FMP[Future Module Preview]
  FMP --> FR[Future Registry]
  FR --> FCMG[Future Controlled Module Generation]
  FCMG --> FM[Future Marketplace]
```
