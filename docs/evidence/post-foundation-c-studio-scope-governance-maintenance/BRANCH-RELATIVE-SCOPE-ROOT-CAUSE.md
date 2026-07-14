# Branch-Relative Scope — Root Cause

## O que acontece

Os slices Studio usam scope-checks que comparam `git diff --name-only origin/main...HEAD`
e afirmam "somente meus arquivos autorizados mudaram". Suas AUTHORIZED lists são
congeladas no momento do slice.

Quando um slice POSTERIOR (legítimo, headless) adiciona novos arquivos, esses arquivos
aparecem no diff-vs-main até o slice mergear. Os scope-checks dos slices ANTERIORES não
conhecem esses paths novos e os marcam como "fora de escopo" — um **falso bloqueio
branch-relative**, não uma falha funcional.

Exemplo concreto (PR #462 — Preview Sandbox):
- O teste `studio-blueprint-engine-foundation` (S16) casa o prefixo amplo
  `src/studio/blueprint-engine/` e sinaliza o teste/gate/evidência novos do Preview Sandbox.
- Vários gates standalone de slices anteriores idem.
- O `outside` continha EXCLUSIVAMENTE artifacts novos do Preview Sandbox.

## Por que não é falha do Preview Sandbox

O Preview Sandbox: gate próprio 74/74, teste próprio 229/229, master g423 7/7, lint/build
PASS, escopo real limpo. A única falha era o scope-check congelado de slice anterior.

## Por que não era correto alterar testes/gates antigos dentro da PR #462

A governança da PR #462 (corretamente) proibiu alterar testes/gates antigos, para manter a
PR pequena e auditável e evitar mudanças invisíveis em asserts alheios. A correção da raiz
pertence a uma PR de governança própria — esta.

## A correção

Centralizar a tolerância num registry + guard explícitos. Os scope-checks antigos passam a
tolerar `known_later_studio_headless_artifact` (lista explícita, sem wildcard), mantendo o
bloqueio de todos os caminhos proibidos e de paths desconhecidos.
