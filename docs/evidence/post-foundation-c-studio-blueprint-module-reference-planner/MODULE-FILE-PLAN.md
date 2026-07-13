# Module File Plan

`createModuleFilePlan` lista os arquivos que um módulo PRECISARIA, agrupados por
categoria: `domain`, `application`, `infrastructure`, `ui`, `tests`, `gates`, `evidence`,
`diagnostics`, `fallback`, `contracts`.

Cada arquivo: `plannedPath`, `category`, `purpose`, `required`,
`generationAllowedNow:false`, `blockedReason`, `futureSlice`, `risk`.

Regras: nenhum arquivo em `src/modules` é criado; paths são planos, não writes; a geração
real fica bloqueada até um slice de geração controlada. Arquivos de backend/Prisma são
`futureSlice`-gated (STUDIO MODULE BACKEND SLICE, risk `high`). `filesWrittenToModule:false`,
`anyFileWritten:false`.
