# MODULE DIAGRAMS — ModeloBase1 Empresas/Campos Direct Beta

## Fluxo de injeção (flag ON)

```mermaid
flowchart TD
  FLAG{{"MAK_MODELOBASE1_EMPRESAS_BETA<br/>(or umbrella)"}}
  CFG["empresasModeloBase1Config.js"]
  BUILD["buildModeloBase1ConfigFromMakModule"]
  NORM["normalizeModeloBase1RuntimeReadModel"]
  SLOT["config.runtimeReadModel (injection slot)"]
  PAGE["ModeloBase1CadastroPage(config)"]

  FLAG -->|on| RM["createEmpresasModeloBase1BetaReadModel()"]
  FLAG -->|off| NULL["null (no read model)"]
  RM --> CFG
  NULL --> CFG
  CFG -->|runtimeReadModel| BUILD
  BUILD --> NORM
  NORM -->|enabled model| SLOT
  NORM -->|null / disabled| NOKEY["no runtimeReadModel key (byte-identical fallback)"]
  SLOT --> PAGE
  NOKEY --> PAGE
```

## Composição do read model beta de Empresas

```mermaid
flowchart LR
  W["createEmpresasModeloBase1BetaReadModel"]
  VM["createEmpresasReadOnlyViewModel<br/>(runtime v2 projection)"]
  DS["createEmpresasControlledDataset<br/>(mock, masked)"]
  WG["createEmpresasReadOnlyWriteGuard<br/>(11 ops blocked)"]
  GEN["createModeloBase1DirectBetaReadModel<br/>(generic descriptor + resolve)"]

  W --> GEN
  W --> WG
  GEN -->|resolveViewModel| VM
  VM --> DS
  GEN -->|resolve()| OUT["resolved read model<br/>(safeClone + live writeGuard)"]
```

## Composição do read model beta de Campos (cadcps)

```mermaid
flowchart LR
  C["createCadcpsModeloBase1BetaReadModel"]
  CVM["createCadcpsBetaViewModel<br/>(from controlled dataset)"]
  CDS["createCadcpsControlledDataset"]
  CWG["createDirectBetaWriteGuard<br/>(read-only)"]
  GEN["createModeloBase1DirectBetaReadModel"]

  C --> GEN
  C --> CWG
  GEN -->|resolveViewModel| CVM
  CVM --> CDS
  GEN -->|resolve()| OUT2["resolved read model"]
```

## Resolução de flag (fail-closed)

```mermaid
flowchart TD
  REQ{"own flag OR umbrella == 'true'?"}
  REQ -->|no| OFF["disabled (fallback)"]
  REQ -->|yes| PROD{"production?"}
  PROD -->|no| ON["enabled (dev/preview)"]
  PROD -->|yes| OVR{"*_ALLOW_PROD == 'true'?"}
  OVR -->|yes| ON
  OVR -->|no| BLOCK["fail-closed (productionBlocked)"]
```

## Invariante — mesmo motor ModeloBase1

```mermaid
flowchart TD
  PAGEMP["PAGEMP.jsx"] --> MB1["ModeloBase1CadastroPage"]
  PAGCPS["PAGCPS.jsx"] --> MB1
  MB1 -->|"passive slot (Phase 2)"| RRM["config.runtimeReadModel"]
```
