import { StreamOptions } from "./types";
import { addToast, updateToast, removeToast } from "./store";
import { generateId } from "./utils";

// El diferenciador de alertmar: toast que actualiza su texto en tiempo real
// mientras llegan chunks de un stream (AI, WebSocket, fetch chunked)
export async function stream(
  source: ReadableStream<Uint8Array> | Response,
  options: StreamOptions = {}
): Promise<string> {
  const id = generateId();
  const decoder = new TextDecoder();
  let fullText = "";

  // Muestra el estado inicial
  addToast({
    id,
    message: options.loading ?? "Cargando...",
    type: "loading",
    duration: 0,
    dismissible: false,
    animation: "slide",
  });

  const body = source instanceof Response ? source.body : source;

  if (!body) {
    removeToast(id);
    throw new Error("[alertmar] El stream no tiene body.");
  }

  const reader = body.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Acumula el texto y actualiza el toast en tiempo real
      fullText += decoder.decode(value, { stream: true });
      updateToast(id, { message: fullText, type: "loading" });
    }

    // Stream terminó — muestra mensaje final
    const doneMsg =
      typeof options.done === "function"
        ? options.done(fullText)
        : (options.done ?? fullText);

    updateToast(id, { message: doneMsg, type: "success", duration: 4000 });
    setTimeout(() => removeToast(id), 4000);

    return fullText;
  } catch (err) {
    updateToast(id, {
      message: options.error ?? "Error en el stream",
      type: "error",
      duration: 4000,
    });
    setTimeout(() => removeToast(id), 4000);
    throw err;
  }
}
