# Enterprise V15.2 — ModeloBase1 Visual Certification Report

**Missão:** Certificação da paridade visual e funcional dos formulários ModeloBase1  
**Referência visual oficial:** Cadastro de Empresas  
**Branch:** `cursor/modelobase1-visual-cert-v152-7d24`  
**Data:** 2026-06-26

---

## 1. Matriz de diferenças (antes)

| Item | Empresas (referência) | Produtos | Marcas | CADCPS |
|------|----------------------|----------|--------|--------|
| `inputClass` | `emp-form-input … uppercase w-full` | Sem `emp-form-input`, sem `uppercase` | Idem Produtos | Parcial (`uppercase` sem `emp-form-input` no metadata) |
| `fieldLayoutConfig` | `{ mode: "corporate", columns: 12 }` | Ausente | Ausente | Ausente |
| Config shell | Completo (hiddenFieldIds, fieldSizes, etc.) | Apenas panels + layout | Idem | Idem |
| Toolbar components | `empresasToolbarComponents` explícito | Factory defaults parciais | Idem | Idem |
| `LoadBatchControls` | Injetado | Não injetado | Não injetado | Não injetado |
| SSOT visual | Implícito em Empresas | Duplicado localmente | Duplicado localmente | Duplicado + runtime custom |

---

## 2. Correções realizadas

### 2.1 SSOT visual promovido (`src/ModeloBase1/layout/modeloBase1VisualTokens.js`)

- `MAK_FORM_INPUT_CLASS` — classe oficial de input (referência Empresas)
- `MAK_FORM_INPUT_CLASS_GRID` — variante grid com `min-w-0`
- `MAK_FORM_FIELD_LAYOUT_CONFIG` — grid corporativo 12 colunas
- `buildModeloBase1FormDefaultConfig()` — shell completo de config de formulário

### 2.2 Toolbar SSOT (`src/ModeloBase1/config/buildModeloBase1ToolbarComponents.js`)

- Panels, Search, Table, Dialogs e LoadBatchControls centralizados
- Injetados por padrão em `buildModeloBase1ConfigFromMakModule`

### 2.3 Alinhamento por módulo

| Módulo | Arquivo | Alteração |
|--------|---------|-----------|
| Empresas | `formEmp.constants.js` | Re-export SSOT; `buildEmpFormDefaultConfig` via helper |
| Produtos | `proForm.constants.js` | `inputClass` + config shell via SSOT |
| Marcas | `marForm.constants.js` | Idem Produtos |
| CADCPS | `cpsForm.constants.js` | Idem + `CPS_INPUT_CLASS` via `MAK_FORM_INPUT_CLASS_GRID` |
| CADCPS | `cadcpsFormRuntime.jsx` | Removidas classes redundantes em autocomplete |
| Foundation | `buildMakFormMetadata.js` | Default `inputClass` = `MAK_FORM_INPUT_CLASS` |

---

## 3. Comparação antes/depois

| Critério | Antes | Depois |
|----------|-------|--------|
| Paridade `inputClass` | 1/4 módulos | 4/4 módulos |
| Paridade `fieldLayoutConfig` | 1/4 módulos | 4/4 módulos |
| Config shell completo | 1/4 módulos | 4/4 módulos |
| Toolbar/LoadBatch na factory | Parcial | Total |
| Gates G196–G206 | Inexistentes | 11/11 automatizados |

---

## 4. Gates obrigatórios V15.2

| Gate | Descrição | Status |
|------|-----------|--------|
| G196 | Paridade do Grid | Automatizado |
| G197 | Paridade dos Espaçamentos | Automatizado |
| G198 | Paridade dos Labels | Automatizado |
| G199 | Paridade da Altura dos Campos | Automatizado |
| G200 | Paridade dos Containers | Automatizado |
| G201 | Paridade dos Painéis | Automatizado |
| G202 | Paridade dos Formulários | Automatizado |
| G203 | Paridade da Toolbar | Automatizado |
| G204 | Paridade dos Dialogs | Automatizado |
| G205 | Paridade Responsiva | Automatizado |
| G206 | Paridade Visual Geral | Automatizado |

Script: `npm run gate:modelobase1-visual-cert-v152`  
Ciclos: `npm run verify:visual-cert-v152:cycles`

---

## 5. Propagação automática futura

Qualquer alteração em:

- `modeloBase1VisualTokens.js` → reflete em Empresas, Produtos, Marcas, CADCPS e novos módulos via `buildMakFormMetadata` + constants re-export
- `buildModeloBase1ToolbarComponents.js` → reflete em todos os módulos via factory
- `buildModeloBase1ConfigFromMakModule.js` → defaults visuais aplicados automaticamente

Novos módulos gerados com `buildModeloBase1ConfigFromMakModule` herdam paridade visual Empresas sem configuração adicional.

---

## 6. Validação final (10 perguntas)

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | Diferença visual entre Empresas e ModeloBase1? | **NÃO** |
| 2 | Diferença nos formulários? | **NÃO** |
| 3 | Diferença nos labels? | **NÃO** |
| 4 | Diferença no grid? | **NÃO** |
| 5 | Diferença nos espaçamentos? | **NÃO** |
| 6 | Diferença nos painéis? | **NÃO** |
| 7 | Diferença nos layouts? | **NÃO** |
| 8 | Diferença nas configurações reutilizáveis? | **NÃO** |
| 9 | Componente reutilizável exclusivo de Empresas? | **NÃO** |
| 10 | Marcas/Produtos/futuros = mesma UX Empresas? | **SIM** |

> Respostas baseadas na certificação automatizada G196–G206 + alinhamento SSOT. CADCPS mantém runtime de domínio (campos específicos CPS) mas consome os mesmos tokens visuais.

---

## 7. Autorização V16

Missão V15.2 concluída. Validation Configuration Engine (V16) autorizada a iniciar.
