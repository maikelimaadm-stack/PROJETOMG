import { useEffect, useState } from "react";

// Alinhado ao padrão oficial em erp-responsive.css (mobile <= 640px).
const MOBILE_BREAKPOINT = 641;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mediaQuery.addEventListener("change", onChange);
    onChange();
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
