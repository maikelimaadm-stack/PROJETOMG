import { Toaster } from "sonner";

/**
 * Toast global do ERP — canto superior direito, empilhado, duração por tipo.
 */
export function ErpToaster() {
  return (
    <Toaster
      position="top-right"
      expand
      visibleToasts={5}
      closeButton={false}
      richColors={false}
      offset={16}
      gap={10}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: "erp-toast-base",
          title: "erp-toast-title",
          description: "erp-toast-description",
          closeButton: "erp-toast-close",
          success: "erp-toast-success",
          error: "erp-toast-error",
          warning: "erp-toast-warning",
          info: "erp-toast-info",
        },
      }}
    />
  );
}
