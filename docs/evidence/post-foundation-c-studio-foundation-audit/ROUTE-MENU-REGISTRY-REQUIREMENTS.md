# Route / Menu / Registry Requirements

## Route Plan

routeId · routePath · routeType · devOnly · betaOnly · productionAllowed · guardRequired ·
flagRequired · permissionRequired · componentBinding · fallbackRoute · diagnostics.

## Menu Plan

menuId · label · group · order · icon · visibilityPolicy · permissionRequired · betaOnly ·
productionAllowed · flagRequired · diagnostics.

## Module Registry

- **nenhum módulo aparece no menu automaticamente**;
- **nenhum módulo ganha rota produtiva automaticamente**;
- registro deve ser controlado (slice explícito + gate);
- gates devem validar App.jsx/menu (ver productionUiGuard existente);
- rollback por flag;
- menu invisível por padrão em beta.

O padrão de referência já existe no repo: rotas dev-only guardadas (runtime-v2 / ModeloBase2 fuel)
atrás de `shouldMount…()` + flag, fail-closed em produção. O Studio deve seguir esse mesmo padrão.
