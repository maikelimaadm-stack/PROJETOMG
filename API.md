# API do Backend

Base local padrão: `http://localhost:3001`

## Health

- `GET /api/health`

## Auth

- `GET /api/auth/session`

## Empresas

- `GET /api/empresas`
- `GET /api/empresas/:id`
- `POST /api/empresas`
- `PUT /api/empresas/:id`
- `DELETE /api/empresas/:id`

## Campos Personalizados (Empresas)

- `GET /api/empresas/campos`
- `POST /api/empresas/campos`
- `PUT /api/empresas/campos/:id`
- `DELETE /api/empresas/campos/:id`
- `POST /api/empresas/options`

## Anexos

- `GET /api/anexos?entityName=&recordId=`
- `POST /api/anexos`
- `DELETE /api/anexos/:id`
- `POST /api/anexos/upload`

## Contratos frontend

- `src/apis/auth/AuthApi.js`
- `src/apis/empresa/EmpresaApi.js`
- `src/apis/anexos/AnexosApi.js`
- `src/apis/http/apiClient.js`
