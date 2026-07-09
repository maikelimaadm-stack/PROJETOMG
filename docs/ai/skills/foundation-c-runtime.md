# Skill — Foundation C Runtime (portável)

**Substitui no Cursor:** contexto automático de `src/runtime/` + docs runtime-implementation  
**Use quando:** implementar slice C.N, gates G423-*, testes runtime

---

## Escopo atual

| Campo | Valor |
|-------|-------|
| Programa | Foundation C — Runtime Bridge |
| Código | `src/runtime/` |
| Slices feitos | C.1–C.4 |
| **Próximo** | **C.5** — M20 + M09 |
| Testes | `npm run test:runtime` (66) |

## Pipeline implementado

```
Bootstrap → Context → Session → Registry → Loader → CRB
  → Dependency Resolver → Router → Runtime Ready
```

Orquestrador: `src/runtime/core/bootstrap/loadRuntimeBundle.js`

## Regras invioláveis

1. **1 slice = 1 PR** — não antecipar slices futuros
2. **Não alterar** `docs/runtime-implementation/` (SSOT)
3. **Diagrama Mermaid** por módulo novo em `docs/evidence/foundation-cN/MODULE-DIAGRAMS.md`
4. **Padrão de código** (copiar C.1–C.4):

```
src/runtime/core/<module>/
  <Module>Manager.js ou <module>.js
  errors.js                    # MAK-L3-RUNTIME-NNN
src/runtime/types/<module>.js
src/runtime/__tests__/<module>/
scripts/gates/g423-NN-*.mjs
```

5. **Runtime não query MMM DB** — CRB via loader apenas (D-RI-13)
6. **Fail-closed** permissions: deny > allow > default deny

## C.5 — checklist implementação

### M20 Service Locator
- [ ] Wire serviços core M01–M08
- [ ] Singleton vs scoped lifetimes
- [ ] Substituir stub em `infra/service-locator/`
- [ ] Gate `npm run gate:g423-20`

### M09 Permission Engine
- [ ] Matriz CRB
- [ ] `can()`, `filterVisible`
- [ ] `router.canActivate()` real (hoje sempre `true`)
- [ ] Gate `npm run gate:g423-09`

### Regressão
- [ ] `npm run gate:g423-01` … `08` PASS
- [ ] `npm run test:runtime` PASS

### Evidências
- [ ] `docs/evidence/foundation-c5/CERTIFICATION-REPORT.md`
- [ ] `docs/evidence/foundation-c5/MODULE-DIAGRAMS.md`

## SSOT references (ler, não editar)

- `docs/runtime-implementation/10-DELIVERY-PLANNING.md`
- `docs/runtime-implementation/08-DONE-CRITERIA.md`
- `docs/runtime-implementation/03-INTERFACES.md`
- `docs/runtime-implementation/06-BOOTSTRAP-SEQUENCE.md` (RT-5)
- `docs/runtime-implementation/09-GATES.md`

## Fixture de teste

`src/runtime/__tests__/fixtures/empresas-crb.fixture.js`

## API pública

Ver exports em `src/runtime/index.js`

## Débito conhecido (não resolver em C.5)

- Render M12 → C.8+
- Action M10 → C.6
- Cache M21 → C.15
- hydrate RT-0→RT-8 completo → C.17
