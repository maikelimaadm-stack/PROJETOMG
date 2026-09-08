# Matriz positiva

| caso | diff | boundary |
|------|------|----------|
| A | `.github/workflows/foundation-governance.yml` | notApplicable, non_studio_branch, safe, activeSliceId=null |
| B | `README.md`, `vite.config.js`, `eslint.config.js`, `.gitignore` | idem |
| C | vários caminhos, todos non-Studio | idem |
| D | runtime histórico sobre A/B/C | não impõe contrato de fatia antiga |

Prova executável de ponta a ponta, numa branch cujo diff é só o workflow:

```
npm run test:runtime   → 23544 tests · 23544 pass · 0 fail · 0 skipped · 0 todo
npm run gate:g423      → PASS 7/7
```

Antes desta fatia, a mesma branch dava 23520 pass / 24 fail.
