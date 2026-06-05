import { useEffect, useState } from "react";

const QUERY = "(max-width: 1024px)";

export function useCardCollapsibleEnabled() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia(QUERY);
    const handleChange = () => setEnabled(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return enabled;
}
