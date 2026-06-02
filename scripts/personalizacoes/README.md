# Personalizações locais — Cadastro de Empresas

Use este fluxo para ajustar layout e colunas **localmente**, sem enviar nada ao backend, e depois transformar em PR.

## Setup (uma vez)

```bash
cp .env.local.example .env.local
npm run personalizacoes:init
npm run dev
```

Com `VITE_LOCAL_PERSONALIZACOES=true`, o sync remoto do layout fica desligado.

## Ajustar na UI

1. Entre em **Cadastro de Empresas**
2. Configure layout do formulário, colunas da tabela, exportação etc.
3. As preferências ficam no `localStorage` da sua máquina

## Exportar do navegador

Abra o console (F12) e rode:

```js
window.__empPersonalizacoes.exportFormLayout()
// ou
await window.__empPersonalizacoes.copyFormLayout()
```

Salve o arquivo em:

`.local/personalizacoes/empresas/form-layout.snapshot.json`

A pasta `.local/` **não vai para o git**.

## Validar e aplicar no código (quando for abrir o PR)

```bash
npm run personalizacoes:import -- .local/personalizacoes/empresas/form-layout.snapshot.json
npm run personalizacoes:status
npm run personalizacoes:apply-form-layout
git diff src/modules/empresas/components/formEmp.constants.js
```

O comando `apply-form-layout` atualiza os defaults em `formEmp.constants.js`. Revise o diff antes de commitar.

## Branch sugerida para o PR

`cursor/personalizacoes-locais-7ea5`
