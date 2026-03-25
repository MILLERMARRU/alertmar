// Sistema de eventos interno — sin dependencias externas
type Handler<T = unknown> = (data: T) => void;

class EventEmitter {
  private listeners = new Map<string, Set<Handler>>();

  on<T>(event: string, handler: Handler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as Handler);

    // Retorna función para desuscribirse
    return () => {
      this.listeners.get(event)?.delete(handler as Handler);
    };
  }

  emit<T>(event: string, data: T): void {
    this.listeners.get(event)?.forEach((handler) => handler(data));
  }
}

export const emitter = new EventEmitter();
