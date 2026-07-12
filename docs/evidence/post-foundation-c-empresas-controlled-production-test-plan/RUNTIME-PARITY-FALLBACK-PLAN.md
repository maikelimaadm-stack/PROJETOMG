# Runtime Read Model & Parity / Fallback Plan — Empresas

`runtimeReadModel` runtime-v2 (direct-beta, read-only) é injetado apenas com
`MAK_MODELOBASE1_EMPRESAS_BETA` on (dev-only, fail-closed; `*_ALLOW_PROD` para override auditado).
Off → `null` → fallback byte-idêntico.

## Testes de runtimeReadModel / fallback

1. Flag off retorna comportamento legado **byte-idêntico**.
2. Flag on em ambiente permitido ativa o `runtimeReadModel`.
3. Falha do runtime-v2 aciona **fallback**.
4. Fallback não muda UI.
5. Fallback não muda ordenação.
6. Fallback não muda filtros.
7. Fallback não muda paginação.
8. Fallback não muda ações.
9. Diagnóstico não contém dados sensíveis.
10. Runtime-v2 **não** contorna permissões.
11. Runtime-v2 **não** acessa Prisma diretamente.
12. Runtime-v2 **não** altera o write path.
13. Runtime-v2 **não** muda tenant scope.
14. Runtime-v2 **não** muda preferências.

## Matriz de paridade ModeloBase1 × runtime-v2

quantidade de registros · IDs · ordem · filtros · busca · paginação · colunas · formatação ·
ações disponíveis · permissões · estados vazios · loading · erro · fallback · preferências · tenant scope.

## Tolerância

- **Identidade exata** onde possível.
- Divergências permitidas **apenas se documentadas**.
- **Nenhuma divergência silenciosa** — o parity gate futuro falha em divergência não justificada.

## Relação com o trabalho já existente

A paridade de leitura já é parcialmente coberta por: `empresas-dual-read-shadow-compare`,
`empresas-read-ui-parity-hardening`, `empresas-runtime-bridge-read-slot-candidate`,
`empresas-read-ui-runtime-bridge-dry-run` e os previews. Este plano consolida e estende essa
cobertura para o piloto local read-only.
