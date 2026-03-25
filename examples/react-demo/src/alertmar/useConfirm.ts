import { useEffect, useState } from "react";
import { onConfirm } from "@alertmar/core";
import type { ConfirmRequest } from "@alertmar/core";

// Hook que escucha peticiones de confirm() del core
export function useConfirm(): ConfirmRequest | null {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);

  useEffect(() => {
    const unsubscribe = onConfirm((req) => setRequest(req));
    return unsubscribe;
  }, []);

  return request;
}
