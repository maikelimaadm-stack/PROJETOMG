import { useMemo } from "react";
import { __MODULE_ID_PASCAL__ModuleDefinition } from "@/modules/__MODULE_ID__/config/moduleDefinition";

export default function use__MODULE_ID_PASCAL__Module() {
  return useMemo(() => __MODULE_ID_PASCAL__ModuleDefinition, []);
}

