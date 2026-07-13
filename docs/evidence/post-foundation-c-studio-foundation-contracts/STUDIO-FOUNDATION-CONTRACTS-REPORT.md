# STUDIO FOUNDATION CONTRACTS — RELATÓRIO

## Visão geral

O MAK Studio é uma **fábrica de módulos**. Esta fundação define, de forma
**headless e contract-only**, o vocabulário e as garantias que qualquer módulo
gerado pelo Studio deverá respeitar — sem ainda gerar nenhum módulo.

Tudo vive em `src/studio/foundation-contracts/`, é puro (sem React, sem I/O) e
determinístico (mesmo input → mesmo digest FNV-1a).

## Composição

`createStudioFoundationContract()` compõe:

1. Metamodelo (19 entidades conceituais)
2. Envelope de Blueprint + estados de ciclo de vida
3. Contratos: Module, Field, Screen, Validation, Permission, Route/Menu,
   Persistence Boundary, Runtime Binding
4. Safety Policy (20 invariantes) + Diagnostics + Fallback
5. Manifest (digest agregado) + Verifier (recomputa o digest e checa invariantes)
6. Compatibility Checker (breaking vs backward_compatible)

Status esperado: **`foundation_contract_ready`**, com
`safeToUseAsFoundationReference: true`.

## Garantias headless

Todas as flags de capacidade (`STUDIO_HEADLESS_CAPABILITIES`) são `false` exceto
`headless: true`. O verificador falha se qualquer uma for ligada.

## Determinismo & integridade

O manifest calcula `overallDigest` a partir de todos os sub-digests. O verificador
recomputa o `overallDigest` — qualquer digest adulterado invalida o pacote
(detecção de tampering).

## Referências de runtime

- `src/runtime/generic-model` — kernel de contratos/safety/diagnostics
- ModeloBase1 — referência de cadastro
- ModeloBase2 (experimental) — referência operacional
- `empresas-local-read-contract@1.0.0` — **seed model certificado** (não reescrito)
