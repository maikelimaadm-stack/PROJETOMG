# Environment Safety Matrix — Empresas

## Classificação de ambientes

### Produção

**Permitido:** leitura documental; observabilidade passiva; health check não destrutivo (se já
existir, sem dados sensíveis); inspeção de logs sanitizados (slice futuro explícito).

**Proibido:** create; update; delete; migration; seed; permission mutation; preference mutation;
teste automatizado destrutivo; execução com credencial humana produtiva.

### Staging isolado (ambiente preferencial para testes reais)

Deve possuir: banco separado; tenant separado; secrets separados; URL separada; JWT separado;
dataset sintético; **nenhum dado pessoal produtivo**; migration policy controlada; rollback conhecido.

### Local integration

Permitido: backend local; banco local/efêmero; fixtures; testes de contrato; testes de repositório;
migration em cópia sintética; create/update/delete isolados.

### Test unitário

Permitido: adapters; payloads; validações; runtimeReadModel; fallback; permission resolver;
multiempresa; cache otimista; erros tipados. Sem I/O real.

## Matriz de operações

| Operação | Unit | Local Integration | Staging | Produção |
|---|---|---|---|---|
| Listar empresas | permitido | permitido | permitido | somente observação controlada |
| Ler empresa sintética | permitido | permitido | permitido | proibido como teste |
| Criar empresa sintética | simulado | permitido | permitido com gate | proibido |
| Atualizar empresa sintética | simulado | permitido | permitido com gate | proibido |
| Excluir empresa sintética | simulado | permitido | permitido com rollback | proibido |
| Alterar preferências | simulado | fixture isolada | usuário sintético | proibido |
| Testar permissões | simulado | usuários sintéticos | usuários sintéticos | proibido |
| Migration | validação | banco efêmero | somente plano aprovado | proibido |
| Prisma mutation | mock/repository | banco local | staging isolado | proibido |

## Sinais de detecção de produção (para o environment gate futuro)

- `DATABASE_URL` apontando para o banco de produção
- `API_URL` / `VITE_API_URL` apontando para `projetomg-production.up.railway.app`
- ausência de flag de allow explícita para o ambiente de teste
- tenant/usuário não marcados como sintéticos

Detectado qualquer um → **falha fechada** (nenhuma mutation permitida).
