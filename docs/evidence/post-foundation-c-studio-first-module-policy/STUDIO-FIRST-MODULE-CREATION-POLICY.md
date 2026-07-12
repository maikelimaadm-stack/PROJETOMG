# Studio-First Module Creation Policy

Documento central deste slice.

## Decisão oficial

**Nenhum módulo novo real será criado manualmente agora.**

**Módulos novos só devem ser criados quando o Studio e o Module Blueprint estiverem prontos.**

## Motivo

- evitar criar módulo manual que depois será refeito
- garantir que módulos futuros nasçam configuráveis
- garantir que telas, campos, permissões, rotas, menu e persistência sigam o mesmo padrão
- garantir que o Studio seja a fonte de criação de modelos/módulos
- garantir que novos módulos já nasçam compatíveis com marketplace/blueprints futuros

## Antes de criar módulos reais, precisam existir

1. **Studio Foundation**
2. **Module Blueprint**
3. **Field Blueprint**
4. **Screen Blueprint**
5. **Validation Blueprint**
6. **Permission Blueprint**
7. **Route/Menu Blueprint**
8. **Persistence Boundary**
9. **Diagnostics/Gates** para módulos gerados
10. **Module Registry** controlado

## Permitido antes do Studio

- auditar Empresas
- melhorar Empresas
- testar backend/Prisma em Empresas com slice explícito
- melhorar ModeloBase1
- melhorar gates
- melhorar docs
- criar prototypes/sandboxes claramente marcados como experimentais
- planejar Studio/Blueprint

## Proibido antes do Studio

- criar `src/modules/combustivel`
- criar `src/modules/fuel`
- criar `src/modules/pesagem`
- criar `src/modules/apontamento`
- criar menu produtivo para módulo novo
- criar rota produtiva para módulo novo
- criar backend/schema para módulo novo
- criar módulo novo manual que deveria nascer pelo Studio

## Condição para liberar módulos futuros

- aprovação explícita do mantenedor
- **Studio Foundation** concluída
- **Module Blueprint** concluído
- **Module Registry** definido
- persistência decidida
- permissões definidas
- gates de criação de módulo prontos
