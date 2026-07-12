# QUALITY & SCALABILITY NOTES — EMPRESAS CONTROLLED PRODUCTION TEST PLAN

## Objetivo

Planejar testes seguros sobre um cadastro que já possui backend, Prisma e dados de produção.

## Qualidade

- produção não é usada como sandbox
- dados sintéticos são obrigatórios
- testes destrutivos ficam fora de produção
- paridade e fallback são verificáveis
- cada fase possui gate
- rollback é obrigatório

## Escalabilidade

- matriz reutilizável para outros cadastros existentes
- tenant sintético permite testar multiempresa
- fixtures determinísticas permitem repetição
- testes locais reduzem risco e custo
- staging isolado prepara pilotos futuros
- produção fica reservada à observabilidade passiva

## Riscos

- credencial produtiva usada por engano
- `DATABASE_URL` produtiva em teste
- fixture sem identificação
- cleanup incompleto
- tenant leakage
- preferência real sobrescrita
- runtime-v2 divergente
- migration acidental
- DELETE amplo

## Mitigações

- environment gate
- fixture contract
- testRunId
- tenant sintético
- usuário sintético
- mutation block
- cleanup gate
- parity gate
- no-production-write policy

## Custo

Slice **somente docs/tests/gate** — custo zero em runtime de produção, zero alteração de código,
zero dependência nova. Valor: plano executável e seguro que precede qualquer piloto real.
