-- DropIndex
DROP INDEX "lifecycle_sync_state_cliente_id_group_id_entity_type_entity_key";
-- CreateIndex
CREATE UNIQUE INDEX "lifecycle_sync_state_cliente_id_group_id_tenant_id_entity_t_key" ON "lifecycle_sync_state"("cliente_id", "group_id", "tenant_id", "entity_type", "entity_id");
