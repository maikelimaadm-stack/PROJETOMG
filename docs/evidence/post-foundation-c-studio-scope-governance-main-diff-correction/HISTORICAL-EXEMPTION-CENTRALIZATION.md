# Historical exemption centralization

Antes desta fatia existiam **três** mecanismos de isenção diferentes para os mesmos regexes
históricos. Agora existe **um**.

| antes | onde | problema |
|---|---|---|
| helper local `migrationExempt` | 17 testes | reimplementado arquivo a arquivo; a quarta variante era questão de tempo |
| `startsWith('studio-scope-governance-')` | 10 gates + 4 testes | prefixo casa 3 fatias, 2 delas ANTERIORES; sem checagem de path |
| `isKnownLaterStudioHeadlessArtifact` / `classifyStudioScopePath` | 2 gates | chronology-free: nunca recebe o conjunto de arquivos |

Todos passaram a usar:

```js
const activeAuthorizer = createResolvedActiveStudioSlicePathAuthorizer(files);
activeAuthorizer.isAuthorized(path)
```

## Os 17 testes

```
empresas-certified-blueprint-mirror-alignment-audit.test.js
empresas-local-read-contract-certification.test.js
empresas-local-read-only-contract-pilot.test.js
empresas-local-read-parity-hardening.test.js
empresas-studio-compatibility-slice-1.test.js
post-foundation-c-empresas-controlled-production-test-plan.test.js
post-foundation-c-studio-foundation-audit.test.js
studio-authoring-runtime-to-preview-bridge-hardening.test.js
studio-authoring-runtime-to-preview-bridge-source-shape-alignment.test.js
studio-blueprint-contract-certification.test.js
studio-blueprint-contract-hardening.test.js
studio-blueprint-engine-foundation.test.js
studio-blueprint-module-reference-planner.test.js
studio-bridge-decision-envelope-identity-contract.test.js
studio-bridge-to-preview-sandbox-runtime-contract.test.js
studio-foundation-contracts.test.js
studio-module-preview-sandbox-contract.test.js
```

## Os 12 gates

```
g423-studio-blueprint-engine-foundation.mjs
g423-studio-blueprint-module-reference-planner.mjs
g423-studio-authoring-runtime-to-preview-bridge-source-shape-alignment.mjs
g423-studio-authoring-runtime-to-preview-bridge-hardening.mjs
g423-studio-bridge-to-preview-sandbox-runtime-contract.mjs
g423-studio-bridge-decision-envelope-identity-contract.mjs
g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan.mjs
g423-studio-bridge-decision-core-envelope-contract.mjs
g423-studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment.mjs
g423-studio-bridge-decision-core-envelope-builder-contract.mjs
g423-studio-bridge-decision-core-envelope-builder-implementation-plan.mjs
g423-studio-dev-preview-app-integration.mjs
```

## Os dois gates chronology-free

O filtro que shippava na `main` era:

```js
const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f))
  && !isKnownLaterStudioHeadlessArtifact(f) && classifyStudioScopePath(f) !== 'forbidden_scope'
  ? true : filterForbiddenScopePaths([f]).length > 0);
```

Agora é:

```js
const activeAuthorizer = createResolvedActiveStudioSlicePathAuthorizer(files);
const bad = files.filter((f) => (FORBIDDEN.some((re) => re.test(f)) && !activeAuthorizer.isAuthorized(f))
  || filterForbiddenScopePaths([f]).length > 0);
```

O array `FORBIDDEN` local está **byte a byte igual** ao de `73d298e0`. Só a isenção mudou, e
ficou estritamente mais estreita: passou a exigir uma fatia ativa resolvida e autorização exata.

## O que NÃO foi centralizado

As chamadas diretas de `isKnownLaterStudioHeadlessArtifact` e `classifyStudioScopePath` que são
**asserções sobre a própria API** (por exemplo, `G423-AI — App.jsx NOT in known-later (leak-safe)`)
continuam, porque provam a semântica da API e não isentam nenhum regex histórico.
