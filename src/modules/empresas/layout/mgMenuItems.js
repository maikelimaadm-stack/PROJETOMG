import { ERP_MENU_SECTIONS } from "@/shared/navigation/erpMenuConfig";

/** Itens reais do menu ERP (somente módulos implementados). */
export function getErpFlatMenuItems() {
  return ERP_MENU_SECTIONS.flatMap((section) =>
    (section.items ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      path: item.routePath,
    }))
  );
}
