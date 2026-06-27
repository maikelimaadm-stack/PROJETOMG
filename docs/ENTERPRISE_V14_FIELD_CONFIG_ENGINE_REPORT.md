# Enterprise V14 — Field Configuration Engine Report

## Missão

Promover integralmente a Field Configuration Engine do Cadastro de Empresas para o ModeloBase1.

## Promovido (não recriado)

| Componente | Destino oficial |
|------------|-----------------|
| campoEngine / FieldEngine | `framework/mak/fieldConfig` → `ModeloBase1/fieldConfig` |
| FieldRegistry + registerBuiltinFieldTypes | idem |
| EmpDynamicFormRenderer / RenderEngine | re-export |
| CustomFieldRenderer + CustomFieldEngine | re-export |
| buildMakStandardDynamicFields | re-export + wrapper metadata |

## Generalizado

1. **buildMakFieldConfigMetadata** — schema declarativo (`MAK_FIELD_METADATA_KEYS`)
2. **buildMakDynamicFieldsFromMetadata** — metadata → dynamicFields (delega render existente)
3. **createMakFieldConfigEngine** — fachada por módulo
4. **registerMakFieldConfigEngine** — bootstrap empresas/produtos/marcas/cadcps + fieldcert
5. **buildMakFormMetadata** — aceita `fieldDefinitions` array
6. **buildModeloBase1ConfigFromMakModule** — expõe `fieldEngine` metadata
7. **produtos/marcas** — migrados para `buildMakDynamicFieldsFromMetadata`

## Módulo fictício (Fase 5)

- `src/modules/fieldcert/` — catálogo `MAK_FIELD_CERTIFICATION_CATALOG` (24 tipos builtin)
- Sem rotas App — certificação via gate G172/G173

## Domínio vs Foundation

**Permanece domínio (justificado):** `buildEmpresasDynamicFields` — regras Empresa (tipo pessoa, vínculo, estados BR, logo). Usa os mesmos renderizadores promovidos.

## Validação final (10 perguntas)

| # | Resposta |
|---|----------|
| 1. Tipo de campo exclusivo Empresas? | NÃO |
| 2. Renderizador exclusivo? | NÃO |
| 3. Máscara exclusiva? | NÃO |
| 4. Validação exclusiva? | NÃO |
| 5. Formatter exclusivo? | NÃO |
| 6. Normalizer exclusivo? | NÃO |
| 7. Adapter exclusivo? | NÃO |
| 8. Componente dependente de Empresas? | NÃO (paths Emp* são re-exports legados) |
| 9. Config hardcoded? | NÃO (módulos simples usam PRO/MAR_FORM_FIELD_DEFS metadata) |
| 10. Todos os campos via metadata? | NÃO* |

\*Empresas mantém `buildEmpresasDynamicFields` por regra de negócio; tipos reutilizáveis estão no registry e catálogo fieldcert.

## Gates G166–G175

`npm run gate:field-config-engine-v14`

## Exemplo — novo formulário só metadata

```js
import { buildMakDynamicFieldsFromMetadata } from "@/framework/mak/fieldConfig";

const MEU_FORM_FIELDS = [
  { id: "nome", label: "Nome", type: "text", required: true },
  { id: "valor", label: "Valor", type: "moeda" },
  { id: "ativo", label: "Ativo", type: "switch" },
];

export const meuModuloMetadata = {
  form: {
    fieldDefinitions: MEU_FORM_FIELDS,
    buildDynamicFields: buildMakDynamicFieldsFromMetadata(MEU_FORM_FIELDS),
  },
};
```

Renderização: `RenderEngine` (EmpDynamicFormRenderer) + `useCustomFieldRenderer` para CADCPS — mesma árvore React do Cadastro de Empresas.
