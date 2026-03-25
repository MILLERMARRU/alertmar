import { useEffect, useState } from "react";
import { subscribe, getToasts } from "@alertmar/core";
import type { Toast } from "@alertmar/core";

// Hook que escucha cambios en el store del core y re-renderiza React
export function useToasts(): Toast[] {
  const [toasts, setToasts] = useState<Toast[]>(getToasts);

  useEffect(() => {
    // Nos suscribimos al store — el core nos avisa cada vez que hay cambio
    const unsubscribe = subscribe(setToasts);
    return unsubscribe;
  }, []);

  return toasts;
}
