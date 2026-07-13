# Empresas Reference — No Rewrite

O engine consome o **Empresas certified mirror**
(`empresas-certified-blueprint-mirror@1.0.0`) somente como **referência/semente**
(reference-only). Ele registra apenas a identidade e o digest do mirror; **não reescreve
Empresas**, não importa `EmpresaApi`/`apiClient`, não toca backend/Prisma, não lê dado real.

`empresasReference`:
- `referenceOnly: true`
- `rewriteEmpresas: false`
- `mirrorVersion: empresas-certified-blueprint-mirror@1.0.0`
- `safeToUseAsSeed: true` (quando o mirror é seguro como referência)

Empresas permanece o laboratório real controlado; nenhuma mudança de código de Empresas,
UI, rota, menu, backend ou Prisma é feita por este slice.
