import { ConfirmOptions, ConfirmRequest } from "./types";
import { emitter } from "./emitter";
import { generateId } from "./utils";

// Emite un evento de confirmación y espera la respuesta del adapter
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const request: ConfirmRequest = {
      id: generateId(),
      options,
      resolve,
    };
    emitter.emit<ConfirmRequest>("confirm:request", request);
  });
}

// Los adapters escuchan este evento para mostrar el diálogo
export function onConfirm(
  handler: (request: ConfirmRequest) => void
): () => void {
  return emitter.on<ConfirmRequest>("confirm:request", handler);
}
