# LayoutConfigV3 — Formulários corporativos

## Hierarquia

```
Aba (Painel)
  └── Card
        └── Linha
              └── Campo
```

## Schema (`version: 3`)

- `layout[panelId].cards[]`: `{ id, label, order, collapsible, columns, colSpan, rows[], fieldIds[] }`
- `rows[]`: `{ id, order, fieldIds[] }` — quebra explícita; o grid não decide sozinho
- `fieldSizes[fieldId]`: `XS | SM | MD | LG | XL` (grid de 12 colunas)
- `fieldLayoutConfig`: `{ mode: "corporate", columns: 12 }`

## Grid de largura

| Tamanho | Colunas (de 12) |
|---------|-----------------|
| XS      | 1               |
| SM      | 2               |
| MD      | 3               |
| LG      | 4               |
| XL      | 12 (linha inteira) |

## Módulos

| Arquivo | Função |
|---------|--------|
| `layoutConfigV3.js` | Schema, migrador V2→V3, fallback |
| `empFormLayoutStore.js` | Persistência e API de layout |
| `empFormLayoutCards.js` | Cards para render e configurador |
| `empFormFieldGrid.js` | `fieldSize` e spans do grid |
| `empFormLayoutRows.js` | Linhas, empacotamento e CRUD de rows |
| `EmpDynamicFormRenderer.jsx` | Render Painel → Card → Linha → Campo |
| `EmpLayoutConfiguratorDialog.jsx` | Gestão de cards + preview real |

## Compatibilidade

Layouts V2 (lista de `fieldIds` por painel) são migrados automaticamente para um card virtual **Geral**.

## Testes

```bash
npm run test:layout-v3
```
