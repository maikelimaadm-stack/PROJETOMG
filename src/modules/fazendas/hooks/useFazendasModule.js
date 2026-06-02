import { useMemo } from "react";
import { FazendasModuleDefinition } from "@/modules/fazendas/config/moduleDefinition";

export default function useFazendasModule() {
  return useMemo(() => FazendasModuleDefinition, []);
}

