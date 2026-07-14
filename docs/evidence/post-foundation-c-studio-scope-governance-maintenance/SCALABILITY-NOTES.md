# Scalability Notes

## Problema de crescimento

Antes, cada slice novo precisava ampliar as allowlists de TODOS os testes/gates anteriores
(N× edições por slice), com risco de divergência e de allowlists crescerem sem controle.

## Solução central

Uma única `KNOWN_LATER_STUDIO_HEADLESS_ARTIFACTS` explícita, consumida por todos os
scope-checks via `isKnownLaterStudioHeadlessArtifact`. Adicionar um slice headless futuro
passa a ser: registrar seus 4 paths (subtree/test/gate/evidence) na registry — um único
ponto, auditável — em vez de editar dezenas de allowlists.

## Segurança preservada

A registry proíbe wildcards amplos (testado). Forbidden e unknown continuam falhando. A
tolerância é opt-in por path específico, nunca por prefixo perigoso.

## Riscos remanescentes

- A registry ainda precisa ser atualizada por slice futuro (é intencional: explícito e
  auditável, não automático).
- Nem todos os gates standalone antigos foram migrados neste PR; os migrados são os que
  bloqueavam a sequência atual. Os demais podem adotar o helper incrementalmente (ver
  NEXT-STEPS).
- Os scope-checks continuam branch-relative por natureza; resolvem plenamente no merge.
