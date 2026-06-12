import { useEffect, useState } from "react";
import { LIST_SEARCH_DEBOUNCE_MS } from "@/shared/listing/listQueryConfig";

export function useDebouncedValue(value, delay = LIST_SEARCH_DEBOUNCE_MS) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
