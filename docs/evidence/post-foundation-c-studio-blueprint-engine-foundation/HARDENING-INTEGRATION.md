# Hardening Integration

`validateStudioBlueprintAgainstHardening(blueprint)` **consome** a baseline de hardening
CERTIFICADA (`evaluateStudioField` de `src/studio/foundation-contracts/hardening/`) —
não reimplementa a matriz. Cada campo é avaliado com `knownNames` acumulado (para
detecção de duplicados), e cada campo bloqueado pela matriz certificada é reportado em
`blockedFields` com suas `reasons`.

Exemplos bloqueados pela matriz certificada:
- type desconhecido; nome com espaço / não-identificador; nome reservado; duplicado;
- select/multiSelect sem `options`; relation sem `target`; relation sem tenantScope;
- computed com função ou string de código; regex perigosa; protected editável por padrão;
- searchable/sortable/filterable em tipo incompatível; default incompatível com o tipo.

`hardeningBaselineConsumed: true` no resultado prova o consumo do contrato certificado.
