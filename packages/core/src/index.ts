// ══ API pública de @alertmar/core ───────────────────────────────────────────

export { toast } from "./toast";
export { confirm, onConfirm } from "./confirm";
export { promise } from "./promise";
export { stream } from "./stream";
export { subscribe, getToasts } from "./store";

export type {
  Toast,
  ToastType,
  ToastAnimation,
  ConfirmOptions,
  ConfirmRequest,
  PromiseMessages,
  StreamOptions,
} from "./types";

// Objeto unificado — uso: alertmar.toast.success("Hola")
import { toast } from "./toast";
import { confirm } from "./confirm";
import { promise } from "./promise";
import { stream } from "./stream";

const alertmar = { toast, confirm, promise, stream };
export default alertmar;
