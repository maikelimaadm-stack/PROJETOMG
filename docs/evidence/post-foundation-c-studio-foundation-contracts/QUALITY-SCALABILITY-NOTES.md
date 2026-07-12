# QUALITY & SCALABILITY NOTES

## Qualidade

- **Puro e determinístico:** sem React, sem I/O, sem estado global. Mesmo input →
  mesmo digest FNV-1a.
- **Fail-closed:** flags desligadas por padrão e sem escape em produção;
  permissões default-deny; fallback sempre `blocked`.
- **Integridade verificável:** manifest agrega digests; verifier recomputa o
  `overallDigest` e detecta tampering.
- **283 cenários de teste** cobrindo cada contrato, invariantes headless,
  determinismo e escopo git-diff.

## Escalabilidade

- **Studio-first:** o vocabulário (metamodelo + blueprints) é a base para gerar N
  módulos sem duplicar regras.
- **Composição:** cada sub-contrato é isolado e testável; o compositor apenas
  agrega. Adicionar um novo sub-contrato é aditivo (backward_compatible).
- **Compatibilidade governada:** o compatibility checker força major version em
  qualquer relaxamento de segurança, protegendo módulos futuros.
- **Seed model certificado:** Empresas (`empresas-local-read-contract@1.0.0`) é
  referência, não reescrita — reduz risco ao evoluir o Studio.

## Dívidas / observações

- `gate:paridade-visual` pode falhar por `spawnSync ENOENT` em alguns ambientes,
  idêntico à main limpa. Não corrigido neste slice (documentado).
- Comentários Vercel "Ready/Building" são informacionais.
