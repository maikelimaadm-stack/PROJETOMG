# Legacy pre-Studio gate decision

Classificação: `LEGACY_PRE_STUDIO_SCOPE_GATES_NOT_MIGRATED`

Estes 21 gates NÃO foram migrados nesta fatia e NÃO são declarados PASS. Eles continuam vermelhos em qualquer branch Studio, pelo motivo de escopo branch-relative já conhecido, e isso está registrado aqui em vez de mascarado.

```
# nomes de ARQUIVO (os npm scripts usam apelidos diferentes para alguns deles)
g423-modelobase1-empresas-campos-direct-beta
g423-modelobase1-runtime-wiring
g423-modelobase1-beta-ui-hardening
g423-modelobase1-controlled-local-write-plan
g423-modelobase1-controlled-local-write-activation
g423-modelobase1-local-persistence-validation
g423-generic-model-contracts-foundation
g423-modelobase1-adapter-to-generic-kernel
g423-empresas-cadcps-consuming-generic-kernel
g423-modelobase2-prototype-adapter
g423-generic-model-multi-type-hardening
g423-modelobase2-operational-runtime-foundation
g423-modelobase2-fuel-headless-candidate
g423-modelobase2-fuel-beta-ui-sandbox
g423-modelobase2-fuel-dev-preview-route
g423-modelobase2-fuel-module-shell-readiness
g423-empresas-production-baseline-audit
g423-empresas-controlled-production-test-plan
g423-empresas-local-read-only-contract-pilot
g423-empresas-local-read-parity-hardening
g423-empresas-studio-compatibility-slice-1
```

## Motivo

- não pertencem ao catálogo Studio — pertencem aos programas ModeloBase, Empresas e Generic Model;
- não bloqueiam o `npm run test:runtime` oficial;
- não bloqueiam o `npm run gate:g423` oficial;
- precisam de uma governança própria para o universo ModeloBase/Empresas/Generic Model, com a decisão explícita de se `src/studio/**` está dentro ou fora do que eles avaliam.

## Verificação

O teste desta fatia prova, para cada um dos 21, que (a) nenhum deles é possuído por uma fatia do catálogo Studio e (b) nenhum deles consome `evaluateStudioBranchScope` — ou seja, esta fatia realmente não os tocou.

## Estado medido nesta branch

Dos 21, **12 ficam vermelhos** nesta branch, todos no mesmo check de escopo branch-relative que classifica o diretório de evidências desta fatia como fora do escopo deles:

```
g423-modelobase2-prototype-adapter                  30/31
g423-generic-model-multi-type-hardening             26/27
g423-modelobase2-operational-runtime-foundation     31/32
g423-modelobase2-fuel-headless-candidate            33/34
g423-modelobase2-fuel-beta-ui-sandbox               33/34
g423-modelobase2-fuel-dev-preview-route             28/29
g423-modelobase2-fuel-module-shell-readiness        41/42
g423-empresas-production-baseline-audit             20/21
g423-empresas-controlled-production-test-plan       25/27
g423-empresas-local-read-only-contract-pilot        31/33
g423-empresas-local-read-parity-hardening           30/32
g423-empresas-studio-compatibility-slice-1          60/62
```

Os outros 9 ficam verdes. Nenhum dos 21 é declarado PASS por esta fatia; nenhum foi tocado.
