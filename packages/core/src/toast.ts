import { ToastType, ToastOptions } from "./types";
import { addToast, removeToast } from "./store";
import { generateId } from "./utils";

function create(message: string, type: ToastType, options: ToastOptions = {}): string {
  const id = generateId();
  const duration = options.duration ?? 4000;

  addToast({
    id,
    message,
    description: options.description,
    type,
    duration,
    dismissible: options.dismissible ?? true,
    style: options.style,
    animation: options.animation ?? "slide",
  });

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }

  return id;
}

export const toast = {
  show:    (message: string, options?: ToastOptions) => create(message, "default", options),
  success: (message: string, options?: ToastOptions) => create(message, "success", options),
  error:   (message: string, options?: ToastOptions) => create(message, "error",   options),
  info:    (message: string, options?: ToastOptions) => create(message, "info",    options),
  warning: (message: string, options?: ToastOptions) => create(message, "warning", options),
  dismiss: (id: string) => removeToast(id),
};
