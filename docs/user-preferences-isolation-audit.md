# Auditoria — Isolamento de preferências por usuário (Etapa 0)

Data: 2026-06-24  
Branch: `cursor/user-preferences-isolation-7d24`

| Item | Situação atual (antes da correção) | Arquivo/função |
| ---- | ---------------------------------- | -------------- |
| Chave única atual da tabela | `UNIQUE(cliente_id, usuario_id, modulo, tela)` + legado `UNIQUE(usuario_id, screen_key)` | `backend/prisma/schema.prisma` → `UsuarioPreferencia` |
| `usuario_id` existe no model? | Sim, `NOT NULL` | `UsuarioPreferencia.usuario_id` |
| `usuario_id` é nullable? | Não | Prisma schema |
| Preferências atuais compartilhadas por tenant? | **Sim no frontend** (localStorage sem usuário); **Não no backend** (query filtra por token) | `emp_col_*` keys em `tblEmp.constants.js` |
| Backend deriva usuário pelo token? | Sim | `loadAccessScope()` → `accessScope.js` |
| Frontend envia usuário no payload? | Não (apenas modulo/tela/preferencias) | `userPreferencesApi.js` |
| Cache React Query inclui usuário na key? | Parcial — só `userId`, sem `clienteId` | `useEmpresasPreferencesBootstrap.js` |
| localStorage inclui usuário na chave? | **Não** (listagem); form layout parcial (`userId` only) | `empresasPreferencesStorage.js`, `CadastroModuleConfig.js` |
| Eventos entre abas incluem usuário? | **Não** | `empresasPreferencesCache.js` |

## Causa raiz do compartilhamento entre usuários

1. **localStorage compartilhado**: chaves `emp_col_visiveis`, `emp_col_ordem`, etc. sem `cliente_id`/`usuario_id`.
2. **Migração automática perigosa**: `migrateLocalPreferencesIfNeeded` lia localStorage compartilhado e fazia PUT no backend do usuário logado.
3. **React Query** sem `clienteId` na query key — risco de cache cruzado ao trocar tenant.

## Chave única

| Versão | Chave |
| ------ | ----- |
| Anterior (DB legado) | `(usuario_id, screen_key)` |
| Atual (DB) | `UNIQUE(cliente_id, usuario_id, modulo, tela)` |
| Nova (localStorage) | `mg_pref_v2:{clienteId}:{userId}:{modulo}:{tela}:{field}` |

## Estratégia de migração de dados antigos

- **Banco**: registros existentes já possuem `usuario_id`; sem duplicação automática.
- **localStorage legado** (`emp_*`): fallback **somente leitura**; primeira gravação individual usa chave scoped.
- **Não** atribuir prefs legadas ao primeiro usuário que logar.
- **Não** apagar dados legados nesta PR.
