# Self-Guard Fix

## Antes

```js
const outsideOwn = files.filter((f) => !OWN.some((re) => re.test(f)));
```

## Depois

```js
// Branch-relative self-guard checks may run on later Studio headless slices before merge.
// Known later Studio headless artifacts are tolerated here, but forbidden and unknown scopes still fail.
const outsideOwn = files
  .filter((f) => !OWN.some((re) => re.test(f)))
  .filter((f) => !g.isKnownLaterStudioHeadlessArtifact(f));
```

`forbidden` permanece checado por `filterForbiddenScopePaths` e sempre falha. Unknown paths
permanecem em `outsideOwn` (não são known-later) e falham. Known-later (lista explícita,
sem wildcard) é tolerado.

## Novos checks no gate

- self-guard tolera known-later mas bloqueia forbidden/unknown (simulação PR #462 + rogue).
- self-guard está wired ao helper central (não é um `outsideOwn` cru).

## Teste

SG1-SG16 emulam o self-guard e provam: tolera Preview Sandbox; bloqueia src/modules,
Empresas, backend, Prisma, migrations, App.jsx, pages/components, productionUiGuard, unknown;
forbidden/unknown não viram warning; determinístico.
