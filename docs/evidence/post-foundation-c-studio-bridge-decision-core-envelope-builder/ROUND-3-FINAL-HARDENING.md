# Round 3 — Final hardening (PR #495)

Separação vinculante entre (A) defeitos próprios do Builder e (B) dívida sistêmica dos checks branch-relative históricos. Esta rodada corrige integralmente A, retira da PR as alterações inseguras em artefatos históricos e inventaria B sem tentar resolvê-lo aqui.

## A — defeitos próprios do Builder, corrigidos

| Área | Antes | Agora |
|---|---|---|
| Target kind | literal local + exceção documentada | `createTargetPreviewSandboxDescriptor({ mapped: {} }).kind` — derivado do upstream puro; nenhuma literal no subtree; exceção removida |
| Compatibility | 27 chaves, maps comparados só nas chaves esperadas | 34 chaves incluindo `issueStageAllowlist`, `targetDescriptorKind`, owner/architecture/`architectureOneFinal`, `factoryResultKeys`; maps comparados EXATOS (chave extra é blocker); três afirmações separadas |
| Issue model | fallback silencioso para `BUILDER_CONFIG_INVALID` / `unknown` / `blocker` / path vazio | `BuilderIssueConstructionError` — código, severidade, stage e path inválidos LANÇAM; `normalizeIssues` falha fechado; boundary público converte em UMA rejeição fixa |
| Array limit | `array.length > maxSourceDecisionFields` (33) | budget implicado por `maxSourceDecisionBytes`; `maxSourceDecisionFields` volta a significar apenas campos top-level da decision |
| Config | `strict` fictício, valor inválido caía no default | apenas `maxStructureDepth`; qualquer chave desconhecida ou valor inválido é REJEIÇÃO; default só quando ausente; `strict` removido da API |
| Manifest | 8 partes genéricas | 23 partes enterprise, digest por parte + overall, valores de limite / API pública / owner / manual gate dentro do payload digerido |
| Pipeline | afirmava execução dos 23 sem prova direta dos 17–23 | executor + `BOUNDARY_STAGE_VALIDATORS` (7) provados diretamente com contexto válido e adulterado + `PIPELINE_STAGE_PROOF_MATRIX` |
| Readiness | flags hardcoded | todas derivadas de contagens/comparações reais; distingue execução, prova direta e alcançabilidade como primeiro blocker |

## Honestidade sobre os stages 17–23

Muitos defeitos que esses stages cobrem já são bloqueados antes. A PR NÃO afirma que todos podem ser o primeiro blocker end-to-end. Em vez disso:

- **A)** prova end-to-end de que os 23 stages executam em ordem num caso de sucesso;
- **B)** prova unitária direta de cada validador 17–23 (contexto válido → zero issues; contexto adulterado → blocker daquele stage; contexto ausente → fail-closed);
- **C)** matriz stage / responsabilidade / precedência / prova direta / defense-in-depth exportada internamente e verificada.

`readiness.all23StagesReachableAsFirstBlocker` é **false**, declarado explicitamente.
