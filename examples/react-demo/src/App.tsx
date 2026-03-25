import { useState } from "react";
import { toast, confirm, promise, stream } from "@alertmar/core";
import type { ToastType } from "@alertmar/core";
import { Toaster, type ToasterPosition } from "./alertmar/Toaster";
import { ConfirmDialog } from "./alertmar/ConfirmDialog";

// Las 6 posiciones disponibles organizadas como cuadrícula visual
const POSITIONS: { value: ToasterPosition; label: string }[][] = [
  [
    { value: "top-left",    label: "↖" },
    { value: "top-center",  label: "↑" },
    { value: "top-right",   label: "↗" },
  ],
  [
    { value: "bottom-left",   label: "↙" },
    { value: "bottom-center", label: "↓" },
    { value: "bottom-right",  label: "↘" },
  ],
];

export default function App() {
  const [position, setPosition] = useState<ToasterPosition>("bottom-right");

  return (
    <>
      <div style={{ width: "100%", maxWidth: "900px", padding: "40px 20px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, marginBottom: "6px", textAlign: "center" }}>
          alertmar playground
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "32px", textAlign: "center" }}>
          Configura y prueba cada alerta antes de usarla en tu código
        </p>

        {/* Selector de posición global */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          marginBottom: "32px",
          background: "#141414",
          border: "1px solid #2a2a2a",
          borderRadius: "14px",
          padding: "16px 24px",
        }}>
          <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>
            Posición del toast
          </span>

          {/* Cuadrícula 2x3 de botones de posición */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {POSITIONS.map((row, rowIdx) => (
              <div key={rowIdx} style={{ display: "flex", gap: "5px" }}>
                {row.map(({ value, label }) => {
                  const active = position === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setPosition(value)}
                      title={value}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        border: `1px solid ${active ? "#a855f7" : "#2f2f2f"}`,
                        background: active ? "#a855f722" : "transparent",
                        color: active ? "#a855f7" : "#6b7280",
                        cursor: "pointer",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = "#6b7280"; }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = "#2f2f2f"; }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <code style={{ fontSize: "12px", color: "#a855f7", background: "#a855f711", padding: "4px 10px", borderRadius: "6px" }}>
            {position}
          </code>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "16px" }}>
          <ToastPanel />
          <ConfirmPanel />
          <PromisePanel />
          <StreamPanel />
        </div>
      </div>

      <Toaster position={position} />
      <ConfirmDialog />
    </>
  );
}

// ══ Panel: Toast ─────────────────────────────────────────────────────────────

type AnimationType = "slide" | "fade" | "bounce" | "zoom";
type SelectableToastType = Exclude<ToastType, "loading">;
type ToastMethod = "show" | "success" | "error" | "info" | "warning";

const toastMethodByType: Record<SelectableToastType, ToastMethod> = {
  default: "show",
  success: "success",
  error: "error",
  info: "info",
  warning: "warning",
};

function ToastPanel() {
  const [message, setMessage]       = useState("Cambios guardados correctamente");
  const [type, setType]             = useState<SelectableToastType>("success");
  const [duration, setDuration]     = useState(4000);
  const [animation, setAnimation]   = useState<AnimationType>("slide");

  // Descripción
  const [showDesc, setShowDesc]     = useState(false);
  const [description, setDesc]      = useState("Esta es la descripción opcional del toast");

  // Estilo del card
  const [bg, setBg]                 = useState("#ffffff");
  const [hasBorder, setHasBorder]   = useState(false);
  const [borderColor, setBorderColor] = useState("#16a34a");
  const [borderWidth, setBorderWidth] = useState(1);
  const [borderRadius, setBorderRadius] = useState(9999);

  const typeColors: Record<SelectableToastType, string> = {
    success: "#22c55e", error: "#ef4444", warning: "#f59e0b",
    info: "#3b82f6", default: "#3f3f3f",
  };

  const fnName = toastMethodByType[type];

  const previewLines = [
    `toast.${fnName}("${message}", {`,
    showDesc   ? `  description: "${description}",` : null,
    `  duration: ${duration},`,
    `  animation: "${animation}",`,
    hasBorder  ? `  style: { bg: "${bg}", borderColor: "${borderColor}", borderWidth: ${borderWidth}, borderRadius: ${borderRadius} },` : `  style: { bg: "${bg}", borderRadius: ${borderRadius} },`,
    `})`,
  ].filter(Boolean).join("\n");

  function send() {
    toast[fnName](message, {
      description: showDesc ? description : undefined,
      duration,
      animation,
      style: {
        bg,
        borderColor: hasBorder ? borderColor : undefined,
        borderWidth: hasBorder ? borderWidth : 0,
        borderRadius,
      },
    });
  }

  return (
    <Card
      title="toast()"
      badge="básico"
      badgeColor="#3b82f6"
      preview={previewLines}
      onSend={send}
      sendLabel="Enviar toast"
      sendColor={typeColors[type]}
    >
      {/* Mensaje */}
      <Field label="Mensaje">
        <Input value={message} onChange={setMessage} />
      </Field>

      {/* Descripción opcional */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Toggle active={showDesc} onChange={setShowDesc} />
          <span style={{ fontSize: "12px", color: "#6b7280" }}>Agregar descripción</span>
        </div>
        {showDesc && (
          <Input value={description} onChange={setDesc} placeholder="Texto secundario del toast" />
        )}
      </div>

      {/* Tipo */}
      <Field label="Tipo">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {(["success", "error", "warning", "info", "default"] as SelectableToastType[]).map((t) => (
            <Chip key={t} label={t} active={type === t} color={typeColors[t]} onClick={() => setType(t)} />
          ))}
        </div>
      </Field>

      {/* Duración + Animación */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <Field label={`Duración: ${duration}ms`}>
          <input type="range" min={1000} max={8000} step={500} value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={{ width: "100%", accentColor: typeColors[type] }} />
        </Field>
        <Field label="Efecto de entrada">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {(["slide", "fade", "bounce", "zoom"] as AnimationType[]).map((a) => (
              <Chip key={a} label={a} active={animation === a} color="#6366f1" onClick={() => setAnimation(a)} />
            ))}
          </div>
        </Field>
      </div>

      {/* Separador */}
      <div style={{ borderTop: "1px solid #1f1f1f", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <span style={{ fontSize: "11px", color: "#4b5563", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Estilo del card
        </span>

        {/* Fondo */}
        <Field label="Color de fondo">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)}
              style={{ width: "36px", height: "28px", border: "none", borderRadius: "6px", cursor: "pointer", padding: 0 }} />
            <code style={{ fontSize: "12px", color: "#9ca3af" }}>{bg}</code>
            <button onClick={() => setBg("#ffffff")}
              style={{ fontSize: "11px", color: "#6b7280", background: "none", border: "1px solid #2f2f2f", borderRadius: "5px", padding: "2px 8px", cursor: "pointer" }}>
              reset
            </button>
          </div>
        </Field>

        {/* Border radius */}
        <Field label={`Redondez: ${borderRadius >= 9999 ? "pill" : `${borderRadius}px`}`}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input type="range" min={0} max={24} step={2} value={Math.min(borderRadius, 24)}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              style={{ flex: 1, accentColor: typeColors[type] }} />
            <button onClick={() => setBorderRadius(9999)}
              style={{ fontSize: "11px", color: borderRadius >= 9999 ? typeColors[type] : "#6b7280",
                background: "none", border: `1px solid ${borderRadius >= 9999 ? typeColors[type] : "#2f2f2f"}`,
                borderRadius: "5px", padding: "2px 8px", cursor: "pointer", whiteSpace: "nowrap" }}>
              pill
            </button>
          </div>
        </Field>

        {/* Borde */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Toggle active={hasBorder} onChange={setHasBorder} />
            <span style={{ fontSize: "12px", color: "#6b7280" }}>Activar borde</span>
          </div>

          {hasBorder && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <Field label="Color del borde">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)}
                    style={{ width: "36px", height: "28px", border: "none", borderRadius: "6px", cursor: "pointer", padding: 0 }} />
                  <code style={{ fontSize: "12px", color: "#9ca3af" }}>{borderColor}</code>
                </div>
              </Field>
              <Field label={`Grosor: ${borderWidth}px`}>
                <input type="range" min={1} max={4} step={1} value={borderWidth}
                  onChange={(e) => setBorderWidth(Number(e.target.value))}
                  style={{ width: "100%", accentColor: borderColor }} />
              </Field>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ══ Panel: Confirm ───────────────────────────────────────────────────────────

function ConfirmPanel() {
  const [title, setTitle]         = useState("Eliminar usuario");
  const [description, setDesc]    = useState("Esta acción no se puede deshacer.");
  const [confirmText, setConfirm] = useState("Sí, eliminar");
  const [cancelText, setCancel]   = useState("Cancelar");
  const [lastResult, setResult]   = useState<boolean | null>(null);

  async function send() {
    const ok = await confirm({ title, description, confirmText, cancelText });
    setResult(ok);
    toast[ok ? "success" : "info"](ok ? confirmText : cancelText);
  }

  return (
    <Card
      title="confirm()"
      badge="async"
      badgeColor="#a855f7"
      preview={`await confirm({ title: "${title}", ... })`}
      onSend={send}
      sendLabel="Abrir diálogo"
      sendColor="#a855f7"
      extra={
        lastResult !== null ? (
          <span style={{ fontSize: "12px", color: lastResult ? "#22c55e" : "#6b7280" }}>
            Última respuesta: <b>{lastResult ? "confirmado" : "cancelado"}</b>
          </span>
        ) : null
      }
    >
      <Field label="Título"><Input value={title} onChange={setTitle} /></Field>
      <Field label="Descripción"><Input value={description} onChange={setDesc} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <Field label="Botón confirmar"><Input value={confirmText} onChange={setConfirm} /></Field>
        <Field label="Botón cancelar"><Input value={cancelText} onChange={setCancel} /></Field>
      </div>
    </Card>
  );
}

// ══ Panel: Promise ───────────────────────────────────────────────────────────

function PromisePanel() {
  const [loadingMsg, setLoading] = useState("Guardando cambios...");
  const [successMsg, setSuccess] = useState("Guardado correctamente");
  const [errorMsg, setError]     = useState("No se pudo guardar");
  const [delay, setDelay]        = useState(2000);
  const [shouldFail, setFail]    = useState(false);

  function send() {
    const p = new Promise<void>((resolve, reject) =>
      setTimeout(() => (shouldFail ? reject(new Error()) : resolve()), delay)
    );
    promise(p, {
      loading: loadingMsg,
      success: successMsg,
      error:   errorMsg,
    }).catch(() => null);
  }

  return (
    <Card
      title="promise()"
      badge="loading automático"
      badgeColor="#f59e0b"
      preview={`await promise(fetch(...), {\n  loading: "${loadingMsg}",\n  success: "${successMsg}",\n  error: "${errorMsg}"\n})`}
      onSend={send}
      sendLabel={shouldFail ? "Ejecutar (fallará)" : "Ejecutar promise"}
      sendColor={shouldFail ? "#ef4444" : "#22c55e"}
    >
      <Field label="Mensaje loading"><Input value={loadingMsg} onChange={setLoading} /></Field>
      <Field label="Mensaje éxito"><Input value={successMsg} onChange={setSuccess} /></Field>
      <Field label="Mensaje error"><Input value={errorMsg} onChange={setError} /></Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <Field label={`Demora: ${delay}ms`}>
          <input
            type="range"
            min={500}
            max={5000}
            step={500}
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#f59e0b" }}
          />
        </Field>
        <Field label="Simular error">
          <Toggle active={shouldFail} onChange={setFail} />
        </Field>
      </div>
    </Card>
  );
}

// ══ Panel: Stream ────────────────────────────────────────────────────────────

function StreamPanel() {
  const [text, setText]     = useState("Hola, soy alertmar. Esta respuesta llega en tiempo real, igual que un modelo de AI.");
  const [loadingMsg, setLoading] = useState("");
  const [doneMsg, setDone]  = useState("");
  const [speed, setSpeed]   = useState(100);
  const [running, setRunning] = useState(false);

  async function send() {
    if (running) return;
    setRunning(true);

    const words = text.split(" ");
    const encoder = new TextEncoder();

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          await new Promise((r) => setTimeout(r, speed));
        }
        controller.close();
      },
    });

    try {
      await stream(readable, {
        loading: loadingMsg || undefined,
        done:    doneMsg    || ((full) => full),
        error:   "Error en el stream",
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <Card
      title="stream()"
      badge="diferenciador ✦"
      badgeColor="#a855f7"
      preview={`await stream(response.body, {\n  loading: "${loadingMsg || "..."}",\n  done: "${doneMsg || "(texto completo)"}"\n})`}
      onSend={send}
      sendLabel={running ? "Transmitiendo..." : "Iniciar stream"}
      sendColor="#a855f7"
      disabled={running}
    >
      <Field label="Texto a transmitir">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          style={{
            ...inputStyle,
            resize: "vertical",
            height: "auto",
            fontFamily: "inherit",
            lineHeight: "1.5",
          }}
        />
      </Field>

      <Field label="Mensaje inicial (loading)">
        <Input value={loadingMsg} onChange={setLoading} placeholder="Vacío = empieza en blanco" />
      </Field>
      <Field label="Mensaje al terminar (done)">
        <Input value={doneMsg} onChange={setDone} placeholder="Vacío = muestra el texto completo" />
      </Field>

      <Field label={`Velocidad: ${speed}ms por palabra`}>
        <input
          type="range"
          min={30}
          max={400}
          step={10}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#a855f7" }}
        />
      </Field>
    </Card>
  );
}

// ══ Componentes de UI del playground ────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0f0f0f",
  border: "1px solid #2f2f2f",
  borderRadius: "7px",
  padding: "8px 12px",
  color: "#f0f0f0",
  fontSize: "13px",
  outline: "none",
};

function Card({
  title, badge, badgeColor, preview, children,
  onSend, sendLabel, sendColor, disabled = false, extra,
}: {
  title: string;
  badge: string;
  badgeColor: string;
  preview: string | string[];
  children: React.ReactNode;
  onSend: () => void;
  sendLabel: string;
  sendColor: string;
  disabled?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div style={{
      background: "#141414",
      border: "1px solid #2a2a2a",
      borderRadius: "14px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Cabecera */}
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #1f1f1f" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 700 }}>{title}</span>
          <span style={{
            fontSize: "11px",
            padding: "2px 8px",
            borderRadius: "20px",
            background: badgeColor + "22",
            color: badgeColor,
            border: `1px solid ${badgeColor}44`,
          }}>{badge}</span>
        </div>
        {/* Preview del código */}
        <pre style={{
          fontSize: "11px",
          color: "#6b7280",
          background: "#0a0a0a",
          borderRadius: "7px",
          padding: "10px 12px",
          overflowX: "auto",
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}>{preview}</pre>
      </div>

      {/* Campos configurables */}
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
        {children}
      </div>

      {/* Footer con botón */}
      <div style={{
        padding: "14px 20px",
        borderTop: "1px solid #1f1f1f",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
      }}>
        {extra ?? <span />}
        <button
          onClick={onSend}
          disabled={disabled}
          style={{
            padding: "9px 20px",
            borderRadius: "8px",
            border: `1px solid ${sendColor}`,
            background: sendColor + "18",
            color: disabled ? "#6b7280" : sendColor,
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: 600,
            transition: "background 0.15s",
            opacity: disabled ? 0.6 : 1,
          }}
          onMouseEnter={(e) => !disabled && (e.currentTarget.style.background = sendColor + "33")}
          onMouseLeave={(e) => !disabled && (e.currentTarget.style.background = sendColor + "18")}
        >
          {sendLabel}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
    />
  );
}

function Toggle({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!active)}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        background: active ? "#ef4444" : "#2f2f2f",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
        marginTop: "4px",
      }}
    >
      <div style={{
        position: "absolute",
        top: "3px",
        left: active ? "23px" : "3px",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s",
      }} />
    </div>
  );
}

function Chip({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 12px",
        borderRadius: "20px",
        border: `1px solid ${active ? color : "#2f2f2f"}`,
        background: active ? color + "22" : "transparent",
        color: active ? color : "#6b7280",
        cursor: "pointer",
        fontSize: "12px",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}
