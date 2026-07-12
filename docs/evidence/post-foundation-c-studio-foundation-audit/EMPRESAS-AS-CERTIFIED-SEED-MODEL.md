# Empresas as Certified Seed Model

Empresas é o **primeiro modelo de referência certificado** para o Studio aprender.

## O que Empresas ensina

- estrutura de cadastro real (campos, identificadores, tenant)
- payload real e envelope real da API (`items/total/page/pageSize/totalPages/nextCursor`)
- tenant rules reais (`cliente_id`, `empresaHeader`)
- permission expectations reais (`PermissaoEmpresa`, fail-closed)
- preferência/layout real (subsistema de preferences)
- riscos de produção (dados vivos)
- certificação local (`certified_local_read_only`, verifier, compatibility)

## Regras

- o Studio pode usar Empresas como **referência documental**;
- o Studio **não** altera Empresas;
- o Studio **não** gera nova versão de Empresas agora;
- o Studio **não** substitui ModeloBase1 agora;
- o Studio **não** altera backend/Prisma de Empresas agora.

O contrato certificado (`empresas-local-read-contract@1.0.0`) e seu compatibility checker servem de
gabarito para validar futuros blueprints de cadastro sem reescrever Empresas.
