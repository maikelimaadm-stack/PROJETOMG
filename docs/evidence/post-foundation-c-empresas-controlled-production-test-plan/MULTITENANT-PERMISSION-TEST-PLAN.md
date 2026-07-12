# Multi-tenant & Permission Test Plan — Empresas

Escopo multiempresa real: `cliente_id` (tenant), seletor `erp_empresa_id`, header `empresaHeader`,
auth JWT (`tokenStore`), `PermissaoEmpresa`. **Nenhum teste pode usar tenant produtivo.**

## Testes obrigatórios (todos com tenant/usuário sintéticos)

1. Tenant A enxerga Empresa A.
2. Tenant A **não** enxerga Empresa B.
3. Tenant B **não** edita Empresa A.
4. Header (`empresaHeader`) ausente → **falha fechada**.
5. Header inválido → **falha fechada**.
6. JWT sem escopo → **falha fechada**.
7. JWT expirado → **falha fechada**.
8. Permissão ausente (`PermissaoEmpresa`) → bloqueia.
9. Cache (`patchEmpresasCache`) **não** vaza entre tenants.
10. Preferências (`UsuarioPreferencia`) **não** vazam entre empresas.
11. `runtimeReadModel` mantém escopo de tenant.
12. Fallback mantém escopo de tenant.

## Regras

- Todos os testes usam **tenant sintético** (`cliente_id` de teste) e **usuário sintético** (JWT de teste).
- Isolamento é verificado por ID explícito, nunca por varredura ampla.
- Falha fechada é o comportamento esperado default (segurança).
- Nenhum teste toca `PermissaoEmpresa` de usuários reais.

## Mapeamento ao código real (auditado, não alterado)

- Tenant: `cliente_id` (FK `Cliente`, `onDelete: Cascade`).
- Seleção de escopo no cliente: `erp_empresa_id` (localStorage) → `empresaHeader` no `apiClient`.
- Auth: `tokenStore` (JWT) no header Authorization.
- Uniques por tenant: `@@unique([cliente_id, codempresa])`, `@@unique([cliente_id, id_global])`.
