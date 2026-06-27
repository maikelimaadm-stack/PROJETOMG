# Field Configuration Engine — Inventário Técnico (Fase 1 V14)

## Motor central

| Componente | Localização | ModeloBase1 | Depende Empresas? |
|------------|-------------|-------------|-------------------|
| FieldEngine | `cadastro-engine/field/FieldEngine.js` → `campoEngine.jsx` | Re-export `fieldConfig` | Não |
| FieldRegistry | `cadastro-engine/field/FieldRegistry.js` | Re-export | Não |
| registerBuiltinFieldTypes | `cadastro-engine/field/registerBuiltinFieldTypes.js` | Re-export | Não |
| RenderEngine | `RenderEngine.jsx` → `EmpDynamicFormRenderer.jsx` | Re-export | Nome Emp* legado |
| CustomFieldRenderer | `custom-field/CustomFieldRenderer.jsx` | Re-export | Não |
| CustomFieldEngine | `custom-field/CustomFieldEngine.js` | Re-export | Não |
| buildMakStandardDynamicFields | `mak/metadata/buildMakStandardDynamicFields.jsx` | Re-export | Não |
| buildMakDynamicFieldsFromMetadata | `mak/fieldConfig/buildMakDynamicFieldsFromMetadata.js` | SSOT | Não |

## Tipos registrados (FieldRegistry)

| Tipo missão | Registro | Renderer | CustomFieldRenderer |
|-------------|----------|----------|---------------------|
| Texto | text | DefaultControl | ✓ |
| Número | number | DefaultControl | ✓ |
| Decimal | decimal | ✓ | ✓ |
| Moeda | moeda | currency | ✓ |
| Percentual | percentual | percent | ✓ |
| CPF/CNPJ | cpf_cnpj | ✓ | ✓ |
| CEP | cep | ✓ | ✓ |
| Telefone/Celular | tel (+ aliases) | phone | ✓ |
| E-mail | email | ✓ | ✓ |
| URL | url | ✓ | ✓ |
| Data | date | EmpFormDateControl / MgDatePicker | ✓ |
| Hora | time | MgTimePicker | ✓ |
| DataHora | datetime | split date+time | ✓ |
| Select | select | EmpAutocomplete / MgCmdSelect | ✓ |
| MultiSelect | option_list | CadOptionListControl | ✓ |
| Autocomplete/Lookup | autocomplete | MgLookup / EmpAutocomplete | ✓ |
| Checkbox | checkbox | EmpFormToggle / CadToggle | ✓ |
| Switch | switch | ✓ | ✓ |
| Textarea | textarea (+ html/markdown aliases) | ✓ | ✓ |
| Imagem | image | EmpFormImageField / CadFormImageField | ✓ |
| Upload/Arquivo | file (+ assinatura alias) | upload handlers | ✓ |
| Calculado | calculado | formula readonly | ✓ |
| Galeria | galeria | gallery | CADCPS |
| Documentos | documentos | documents | CADCPS |

## Tipos não registrados como builtin (domínio / extensão futura)

Senha, Ano, Mês, Semana, Radio dedicado, Cor, Tags, QRCode, Código de Barras, Avatar, JSON, Editor HTML dedicado, Tabela filha — utilizam `text`/`textarea`/`relation` ou **campos personalizados CADCPS** com configuradores em `framework/cadastro/fields/`.

## Configuradores CADCPS (promovidos, não duplicados)

- `EmpMaskConfig.jsx` — máscaras
- `EmpDecimalConfig.jsx` — decimal/precisão
- `EmpManualOptionsConfig.jsx` — opções manuais
- `EmpRelationConfig.jsx` — lookup/relation
- `EmpCalculationBuilder.jsx` — campos calculados

## Módulos consumidores

| Módulo | buildDynamicFields | Metadata |
|--------|-------------------|----------|
| empresas | buildEmpresasDynamicFields (domínio) | empresasModuleMetadata.form |
| produtos | buildMakDynamicFieldsFromMetadata | PRO_FORM_FIELD_DEFS |
| marcas | buildMakDynamicFieldsFromMetadata | MAR_FORM_FIELD_DEFS |
| cadcps | runtime | CPS native |
| fieldcert | buildMakDynamicFieldsFromMetadata | MAK_FIELD_CERTIFICATION_CATALOG |

## Persistência / validação

- `campoEngine.buildValidationSchema` — Zod por campo obrigatório
- Máscaras: `mascaras_text`, `formatMaskedNumber` em CustomFieldRenderer
- Agregações tabela: `calcularAgregacoes`
