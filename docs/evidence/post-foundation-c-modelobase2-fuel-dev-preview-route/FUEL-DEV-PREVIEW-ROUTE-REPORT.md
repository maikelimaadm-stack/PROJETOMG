# Fuel Dev Preview Route Report

## Objetivo

Abrir a Fuel Beta UI Sandbox no navegador por uma URL **dev-only**, para visualizar o fluxo local
de combustível — sem menu, sem módulo real, sem backend.

## Rota criada

`/__dev/modelobase2/fuel` — montada em `src/App.jsx` **apenas** atrás de
`shouldMountModeloBase2FuelDevPreviewRoute()` (lazy import + `<Route>` guardado). Espelha o padrão
existente `/__dev/runtime-v2/previews`.

## Por que é dev-only

- `shouldMount…` exige ambiente dev/test **E** a flag `MAK_MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE=true`.
- Fail-closed em produção salvo o override explícito `*_ALLOW_PROD` (que emite warning alto).
- Nunca aparece no menu (`menuRegistered:false`).

## Como visualizar

1. Rodar o app em dev (`npm run dev`).
2. Definir `MAK_MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE=true` no `.env.local`.
3. Abrir `http://127.0.0.1:5173/__dev/modelobase2/fuel`.
4. Usar o formulário/tabela/timeline/diagnostics; tudo local em memória.

## Por que ainda não é módulo real

- Sem `src/modules`; sem rota produtiva; sem menu; sem backend/Prisma/persistência.
- Fixtures fictícias; dados nunca saem do navegador (`sent:false`, `persistenceReal:false`).

## Limitações

- Interação demonstrável por state local (React) no Shell; sem integração de browser garantida nos
  testes (validação por source-scan + lógica pura).
- Fallback seguro quando o acesso é negado.

## Próximo passo recomendado

**ModeloBase2 Fuel Module Shell Readiness** — **não** backend write.
