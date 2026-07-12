# ModeloBase1 / ModeloBase2 Relationship

## ModeloBase1

- base atual para cadastros;
- mais próximo de produção;
- usado por Empresas/cadcps;
- deve informar os **primeiros blueprints de cadastro** (modelType `cadastro`).

## ModeloBase2

- experimental/headless;
- base futura para operações (modelType `operacional`);
- Fuel é sandbox;
- **não** deve gerar módulo real agora.

## Studio

- deve orquestrar os dois **futuramente**;
- deve decidir o `modelType` (cadastro → MB1; operacional → MB2);
- deve gerar blueprints compatíveis com o runtime correspondente;
- **não** deve acoplar tudo cedo demais (contratos primeiro, UI depois).
