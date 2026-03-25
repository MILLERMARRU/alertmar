import { Toast } from "./types";
import { emitter } from "./emitter";

// Estado global de notificaciones
let toasts: Toast[] = [];

export function getToasts(): Toast[] {
  return toasts;
}

export function addToast(toast: Toast): void {
  toasts = [...toasts, toast];
  emitter.emit("toasts:change", toasts);
}

export function removeToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emitter.emit("toasts:change", toasts);
}

export function updateToast(id: string, partial: Partial<Toast>): void {
  toasts = toasts.map((t) => (t.id === id ? { ...t, ...partial } : t));
  emitter.emit("toasts:change", toasts);
}

// Los adapters usan esto para escuchar cambios
export function subscribe(handler: (toasts: Toast[]) => void): () => void {
  return emitter.on<Toast[]>("toasts:change", handler);
}
