# alertmar – CLAUDE.md

## Qué es
Librería TypeScript de notificaciones/diálogos framework-agnostic.
Diferenciador clave: **streaming notifications** — toasts que actualizan su texto en tiempo real (respuestas AI, WebSocket, fetch chunked).

## Stack
- **Monorepo pnpm** (`pnpm-workspace.yaml`)
- **`packages/core`** — TypeScript puro, cero dependencias de framework
- **`examples/react-demo`** — playground con Vite + React 18
- **Build:** tsup (CJS + ESM + DTS)
- **Tests:** Vitest (configurado, pendiente de escribir)

## Comandos
```bash
pnpm dev:demo        # levanta el playground React (desde la raíz)
pnpm build:core      # compila packages/core con tsup
pnpm test            # corre vitest en packages/core
```

## Arquitectura del core (`packages/core/src/`)

| Archivo | Responsabilidad |
|---|---|
| `types.ts` | Todos los tipos públicos (Toast, ToastOptions, etc.) |
| `emitter.ts` | EventEmitter simple, retorna función unsubscribe |
| `store.ts` | Estado global de toasts; emite `"toasts:change"` |
| `utils.ts` | `generateId()` |
| `toast.ts` | `toast.show/success/error/info/warning/dismiss` |
| `confirm.ts` | `confirm(options): Promise<boolean>` + `onConfirm` |
| `promise.ts` | `promise<T>(p, messages)` — loading → success/error |
| `stream.ts` | `stream(source, options)` — actualiza toast en tiempo real |
| `index.ts` | Re-exports públicos + objeto `alertmar` default |

## API pública

```ts
import { toast, confirm, promise, stream } from "@alertmar/core";

toast.success("Mensaje");
toast.error("Error", { description: "Detalle", duration: 5000 });
toast.show("Info", { animation: "bounce", style: { bg: "#f0f0f0" } });

await promise(fetch("/api"), { loading: "...", success: "OK", error: "Fallo" });
await stream(response, { loading: "Procesando...", done: "Listo" });
const ok = await confirm({ title: "¿Seguro?", confirmText: "Sí" });
```

## Tipos clave

```ts
type ToastType      = "success"|"error"|"info"|"warning"|"loading"|"default";
type ToastAnimation = "slide"|"fade"|"bounce"|"zoom";

interface ToastStyle {
  bg?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;  // 9999 = pill
}

interface ToastOptions {
  description?: string;
  duration?: number;      // ms, 0 = permanente
  dismissible?: boolean;
  style?: ToastStyle;
  animation?: ToastAnimation;
}
```

## React adapter (`examples/react-demo/src/alertmar/`)

| Archivo | Responsabilidad |
|---|---|
| `useToasts.ts` | Hook que suscribe al store del core |
| `useConfirm.ts` | Hook que suscribe a `onConfirm` |
| `Toaster.tsx` | Componente visual de toasts (6 posiciones) |
| `ConfirmDialog.tsx` | Modal de confirmación |

### `<Toaster>` props
```tsx
<Toaster position="bottom-right" />
// posiciones: top-left | top-center | top-right
//             bottom-left | bottom-center | bottom-right
```

### Layout "toast con descripción"
- **Pill** (`10px 10px 0 0`) sin `borderBottom` + `zIndex: 1`
- **Card** con `marginTop: -1px` y `borderRadius` según posición
- Sin `borderBottom` en el pill para que el card selle visualmente

## Convenciones
- Comentarios en **español**
- Separadores `// ══ Título ────────────────────────────────────`
- Indentación 2 espacios
- Tipos exportados desde `types.ts`, nunca inline en implementaciones

## Pendiente
- [ ] Tests con Vitest en `packages/core`
- [ ] Publicar en npm (`@alertmar/core`)
- [ ] Paquete `@alertmar/react` separado del demo
- [ ] Adapters para Vue y Angular
- [ ] Sitio de documentación
