# Test Matrix — Empresas/cadcps Consuming Generic Kernel

**Suite:** `src/runtime/__tests__/empresas-cadcps-consuming-generic-kernel.test.js`
**Resultado:** 46 subtests · **46 pass / 0 fail**

## Cobertura

### Flags / resolução (1–9)
1. flag off → desabilitado (`consumption-flag-off`)
2. umbrella + beta → habilitado
3. empresas flag + beta → habilitado
4. cadcps flag + beta → habilitado
5. flag on **sem** beta → desabilitado (`beta-read-model-off`)
6. produção fail-closed (sem allow_prod)
7. produção + allow_prod → habilitado
8. helpers de "requested" por módulo
9. módulo desconhecido segue só o umbrella

### Apply — flag OFF = comportamento atual (10)
10. retorna read state atual verbatim; `consumptionApplied:false`; sem `genericKernelApplied`

### Apply — flag ON = passa pelo kernel (11–13)
11. `consumptionApplied:true`, `genericKernelApplied:true`
12. table/form preservam shape (columns/visibleColumns/rows/rowCount/fields/visibleFields)
13. merge preserva campos originais (`moduleId`/`writeBlocked`/`source`/`diagnostics`)

### Apply — fallback (14–18)
14. read state inválido (form ausente) → fallback `generic-validation-failed`
15. adapter que lança → fallback `adapter-failure`, estado original preservado
16. `mapReadToGeneric` ok=false → fallback `generic-validation-failed`
17. `mapGenericToRead` não-objeto → fallback `invalid-read-model`
18. adapter sem métodos → fallback `adapter-failure`

### Apply — invariantes / robustez (19–29)
19. merged state: `backend/prisma/runtimeBridge Touched false`
20. diagnostics: `genericKernelApplied:true` / `readiness:'generic-kernel'`
21. diagnostics fallback: `legacyFallback:true` / `readiness:'legacy'`
22. retorno é cópia segura (mutação não vaza)
23. `moduleId` resolvido do `readState`
24. umbrella habilita empresas **e** cadcps
25. options não-objeto → `MAK-MB1-GKC-001`
26. `readState` null + flag off → legacy, `readState:null`
27. `readState` null + flag on → `beta-read-model-off`
28. `writeBlocked` preservado
29. `genericKernelSource` anotado

### Fallback builder (30–32)
30. `ok:false`, `legacyFallback:true`, read state original
31. fallback + rollbackPlan sem executar rollback
32. sem readState → `readState:null`

### Diagnostics builder (33–36)
33. invariantes locais/sem side effect
34. `consumptionApplied:false` → `readiness:'legacy'`
35. sumariza validation (`valid`/`errorCount`)
36. serializável (sem funções)

### Reversibilidade (37–38)
37. flag off produz o estado atual (sem anotação do kernel)
38. on vs off preservam os mesmos dados de table/form

### Isolamento / invariantes de código (39–46)
39. activation (exceto hook) não importa React; sem backend/Prisma/fetch/storage
40. apenas o hook opcional importa React (e delega ao apply)
41. activation não importa `src/modules/empresas|cadcps`
42. activation consome o adapter ModeloBase1 → generic kernel
43. flags têm os nomes documentados
44. consumo nunca ativa persistência real nem capacidades perigosas
45. retorno (readState + diagnostics) serializável
46. hook opcional existe como função exportada (integração futura)

## Como rodar

```bash
npm run test:runtime:empresas-cadcps-generic-kernel
npm run gate:g423-empresas-cadcps-generic-kernel
```
