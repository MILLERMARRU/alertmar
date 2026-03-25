import { PromiseMessages } from "./types";
import { addToast, updateToast, removeToast } from "./store";
import { generateId } from "./utils";

export async function promise<T>(
  p: Promise<T>,
  messages: PromiseMessages<T>
): Promise<T> {
  const id = generateId();

  // Muestra estado loading inmediatamente
  addToast({ id, message: messages.loading, type: "loading", duration: 0, dismissible: false, animation: "slide" });

  try {
    const data = await p;

    const successMsg =
      typeof messages.success === "function"
        ? messages.success(data)
        : messages.success;

    updateToast(id, { message: successMsg, type: "success", duration: 4000 });
    setTimeout(() => removeToast(id), 4000);

    return data;
  } catch (err) {
    const errorMsg =
      typeof messages.error === "function"
        ? messages.error(err)
        : messages.error;

    updateToast(id, { message: errorMsg, type: "error", duration: 4000 });
    setTimeout(() => removeToast(id), 4000);

    throw err;
  }
}
