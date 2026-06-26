import { useMakSearchHandlers } from "@/framework/mak/listing/useMakSearchHandlers";

/** Wrapper Empresas — mapeia nomes legados para API MAK. */
export function useEmpSearchHandlers(props) {
  return useMakSearchHandlers({
    ...props,
    setTableFilteredRecords: props.setTableFilteredEmpresas,
    setEditingRecord: props.setEditingEmp,
  });
}
