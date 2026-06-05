import dotenv from "dotenv";
import { backfillAllClientesIdGlobal } from "../src/modules/idGlobal/idGlobalService.js";

dotenv.config();

const main = async () => {
  const results = await backfillAllClientesIdGlobal();
  const totalAssigned = results.reduce((sum, item) => sum + item.assigned, 0);
  console.log(`[backfill-id-global] clientes processados: ${results.length}`);
  console.log(`[backfill-id-global] registros atribuídos: ${totalAssigned}`);
  for (const item of results) {
    if (item.assigned > 0) {
      console.log(`  - ${item.clienteId}: ${item.assigned}`);
    }
  }
};

main().catch((error) => {
  console.error("[backfill-id-global] falhou:", error);
  process.exit(1);
});
