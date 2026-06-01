import { useMemo } from "react";
import templateRepository from "@/modules/template/repositories/templateRepository";

export default function useTemplateModule() {
  return useMemo(
    () => ({
      repository: templateRepository,
    }),
    []
  );
}

