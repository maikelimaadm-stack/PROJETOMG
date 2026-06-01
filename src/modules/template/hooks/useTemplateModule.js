import { useMemo } from "react";
import { templateModuleDefinition } from "@/modules/template/config/moduleDefinition";

export default function useTemplateModule() {
  return useMemo(() => templateModuleDefinition, []);
}

