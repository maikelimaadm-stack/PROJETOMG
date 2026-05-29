import { useMemo } from "react";

// Stub hook - setores e áreas retornam listas vazias
export default function useSetorAreas(empresaId) {
  const setores = [];
  const areas = [];
  const getAreasBySetor = useMemo(() => () => [], []);
  return { setores, areas, getAreasBySetor };
}