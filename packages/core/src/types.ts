export type ToastType = "success" | "error" | "info" | "warning" | "loading" | "default";

export type ToastAnimation = "slide" | "fade" | "bounce" | "zoom";

// Estilos visuales opcionales por toast
export interface ToastStyle {
  bg?: string;           // color de fondo
  borderColor?: string;  // color del borde
  borderWidth?: number;  // grosor del borde en px (0 = sin borde)
  borderRadius?: number; // redondez en px (9999 = pill)
}

// Opciones completas al crear un toast
export interface ToastOptions {
  description?: string;
  duration?: number;
  dismissible?: boolean;
  style?: ToastStyle;
  animation?: ToastAnimation;
}

export interface Toast {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
  duration: number;
  dismissible: boolean;
  style?: ToastStyle;
  animation: ToastAnimation;
}

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ConfirmRequest {
  id: string;
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export interface PromiseMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((err: unknown) => string);
}

export interface StreamOptions {
  loading?: string;
  done?: string | ((fullText: string) => string);
  error?: string;
}

export type AlertmarChangeEvent = Toast[];
export type AlertmarConfirmEvent = ConfirmRequest;
