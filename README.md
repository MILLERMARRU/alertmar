# alertmar

Framework-agnostic notification and dialog library with **streaming support** — toasts that update their text in real time as data arrives from an AI response, WebSocket, or chunked fetch.

## Features

- **Streaming toasts** — display live text as it streams in
- **Promise toasts** — automatic loading → success/error lifecycle
- **Confirm dialogs** — `await confirm(...)` returns a boolean
- **6 positions** — top/bottom × left/center/right
- **4 animations** — slide, fade, bounce, zoom
- **Fully customizable** — background, border, border-radius per toast
- **Optional description** — pill header + card body layout
- **Framework-agnostic core** — React adapter included, Vue/Angular coming

## Installation

```bash
npm install @alertmar/core
```

## Quick start

```ts
import { toast } from "@alertmar/core";

toast.success("Saved!");
toast.error("Something went wrong", { description: "Check your connection." });
toast.warning("Low storage", { duration: 6000 });
toast.info("New version available");
toast.show("Hello world");
```

## Async — Promise

```ts
import { promise } from "@alertmar/core";

await promise(fetch("/api/save"), {
  loading: "Saving...",
  success: "Saved!",
  error:   "Failed to save",
});

// Dynamic messages based on result/error
await promise(fetchUser(id), {
  loading: "Loading user...",
  success: (user) => `Welcome, ${user.name}!`,
  error:   (err)  => `Error: ${err.message}`,
});
```

## Streaming

The key differentiator — updates the toast message in real time as chunks arrive:

```ts
import { stream } from "@alertmar/core";

const response = await fetch("/api/ai");
const fullText = await stream(response, {
  loading: "Thinking...",
  done:    "Done!",
  error:   "Stream failed",
});

// Dynamic done message
await stream(response, {
  done: (text) => `Generated ${text.length} characters`,
});
```

Works with any `ReadableStream<Uint8Array>` or `Response` object.

## Confirm dialog

```ts
import { confirm } from "@alertmar/core";

const ok = await confirm({
  title:       "Delete file?",
  description: "This action cannot be undone.",
  confirmText: "Delete",
  cancelText:  "Cancel",
});

if (ok) { /* proceed */ }
```

## Options

```ts
toast.success("Message", {
  description: "Optional subtitle shown below the title",
  duration:    4000,       // ms — 0 = persistent
  dismissible: true,       // show × button
  animation:   "slide",    // slide | fade | bounce | zoom
  style: {
    bg:           "#ffffff",
    borderColor:  "#e5e7eb",
    borderWidth:  1,
    borderRadius: 12,       // 9999 = pill
  },
});
```

## React adapter

```tsx
import { Toaster } from "./alertmar/Toaster";
import { ConfirmDialog } from "./alertmar/ConfirmDialog";

export default function App() {
  return (
    <>
      <YourApp />
      <Toaster position="bottom-right" />
      <ConfirmDialog />
    </>
  );
}
```

### Positions

```
top-left     top-center     top-right
bottom-left  bottom-center  bottom-right
```

## Monorepo structure

```
alertmar/
├── packages/
│   └── core/          @alertmar/core — pure TypeScript, zero dependencies
├── examples/
│   └── react-demo/    Vite + React playground
└── CLAUDE.md
```

## Development

```bash
pnpm install
pnpm dev:demo       # start React playground at localhost:5173
pnpm build:core     # build packages/core with tsup
pnpm test           # run Vitest
```

## Roadmap

- [x] Core (toast, promise, stream, confirm)
- [x] React adapter
- [ ] Tests
- [ ] Publish to npm
- [ ] `@alertmar/vue`
- [ ] `@alertmar/angular`
- [ ] Documentation site

## License

MIT
