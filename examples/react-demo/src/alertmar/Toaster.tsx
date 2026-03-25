import { useRef, useLayoutEffect } from "react";
import {
  CheckCircle, XCircle, AlertTriangle,
  Info, Loader, Bell, X,
} from "lucide-react";
import { toast } from "@alertmar/core";
import type { Toast } from "@alertmar/core";
import { useToasts } from "./useToasts";

// ══ Tipos ────────────────────────────────────────────────────────────────────

export type ToasterPosition =
  | "top-left" | "top-center"    | "top-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

// ══ Config visual por tipo ───────────────────────────────────────────────────

const TYPE_CONFIG: Record<Toast["type"], { color: string; Icon: React.ElementType; spin?: boolean }> = {
  success: { color: "#16a34a", Icon: CheckCircle },
  error:   { color: "#dc2626", Icon: XCircle },
  warning: { color: "#d97706", Icon: AlertTriangle },
  info:    { color: "#2563eb", Icon: Info },
  loading: { color: "#6b7280", Icon: Loader, spin: true },
  default: { color: "#374151", Icon: Bell },
};

// ══ Animaciones CSS ──────────────────────────────────────────────────────────

const ANIMATIONS: Record<NonNullable<Toast["animation"]>, string> = {
  slide:  "alertmar-slide",
  fade:   "alertmar-fade",
  bounce: "alertmar-bounce",
  zoom:   "alertmar-zoom",
};

const KEYFRAMES = `
  @keyframes alertmar-slide {
    from { opacity: 0; transform: translateY(10px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes alertmar-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes alertmar-bounce {
    0%   { opacity: 0; transform: scale(0.4); }
    55%  { opacity: 1; transform: scale(1.06); }
    75%  { transform: scale(0.94); }
    100% { transform: scale(1); }
  }
  @keyframes alertmar-zoom {
    from { opacity: 0; transform: scale(0.6); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes alertmar-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

// ══ Posición ─────────────────────────────────────────────────────────────────

function getPositionStyle(position: ToasterPosition): React.CSSProperties {
  const isTop    = position.startsWith("top");
  const isCenter = position.endsWith("center");
  const isLeft   = position.endsWith("left");
  return {
    top:           isTop  ? "28px" : undefined,
    bottom:        !isTop ? "28px" : undefined,
    left:          isLeft   ? "28px" : isCenter ? "50%" : undefined,
    right:         !isLeft && !isCenter ? "28px" : undefined,
    transform:     isCenter ? "translateX(-50%)" : undefined,
    flexDirection: isTop ? "column" : "column-reverse",
    alignItems:    isCenter ? "center" : isLeft ? "flex-start" : "flex-end",
  };
}

// ══ SVG blob path (inspirado en goey-toast) ──────────────────────────────────
// Genera una forma orgánica continua: la cabecera (pill) en la parte superior
// se conecta al body con curvas bezier suaves, como en goey-toast.
//
// Estructura:
//   y=0          → tope del pill (solo ocupa pillW de ancho)
//   y=pillH      → base del pill / inicio del body (ocupa totalW de ancho)
//   y=totalH     → fondo del body
//
// La curva bezier en y≈pillH conecta suavemente el borde del pill al body.

function buildBlobPath(
  pillW: number, pillH: number,
  totalW: number, totalH: number,
  side: "left" | "right" | "center",
  pillR: number, bodyR: number,
): string {
  // Si el pill ocupa casi todo el body → rectángulo redondeado simple
  if (pillW >= totalW - 4) {
    const r = Math.min(bodyR, totalH / 2, totalW / 2);
    return `M ${r} 0 Q 0 0 0 ${r} L 0 ${totalH - r} Q 0 ${totalH} ${r} ${totalH} L ${totalW - r} ${totalH} Q ${totalW} ${totalH} ${totalW} ${totalH - r} L ${totalW} ${r} Q ${totalW} 0 ${totalW - r} 0 Z`;
  }

  const pr = Math.min(pillR, pillH / 2, pillW / 2);
  const br = Math.min(bodyR, totalH / 2, totalW / 2);

  // Fuerza de la tangente para la curva cúbica S:
  // Los puntos de control quedan en la dirección de entrada/salida (arriba),
  // lo que elimina el "gancho" y crea una transición orgánica continua.
  const cs = Math.min(pillH * 0.45, 16);

  if (side === "right") {
    const pl = totalW - pillW;
    return [
      `M ${totalW - pr} 0`,
      `Q ${totalW} 0 ${totalW} ${pr}`,
      `L ${totalW} ${totalH - br}`,
      `Q ${totalW} ${totalH} ${totalW - br} ${totalH}`,
      `L ${br} ${totalH}`,
      `Q 0 ${totalH} 0 ${totalH - br}`,
      `L 0 ${pillH}`,
      // Curva cúbica S: tangente ↑ en ambos extremos → transición fluida
      `C 0 ${pillH - cs}  ${pl} ${pillH + cs}  ${pl} ${pillH}`,
      `L ${pl} ${pr}`,
      `Q ${pl} 0 ${pl + pr} 0`,
      `Z`,
    ].join(" ");
  }

  if (side === "left") {
    return [
      `M ${pr} 0`,
      `Q 0 0 0 ${pr}`,
      `L 0 ${totalH - br}`,
      `Q 0 ${totalH} ${br} ${totalH}`,
      `L ${totalW - br} ${totalH}`,
      `Q ${totalW} ${totalH} ${totalW} ${totalH - br}`,
      `L ${totalW} ${pillH}`,
      // Curva cúbica S (espejada para lado izquierdo)
      `C ${totalW} ${pillH - cs}  ${pillW} ${pillH + cs}  ${pillW} ${pillH}`,
      `L ${pillW} ${pr}`,
      `Q ${pillW} 0 ${pillW - pr} 0`,
      `Z`,
    ].join(" ");
  }

  // Centrado: dos curvas S simétricas
  const half   = pillW / 2;
  const pLeft  = totalW / 2 - half;
  const pRight = totalW / 2 + half;
  return [
    `M ${pRight - pr} 0`,
    `Q ${pRight} 0 ${pRight} ${pr}`,
    `L ${pRight} ${pillH}`,
    `C ${pRight} ${pillH - cs}  ${totalW} ${pillH + cs}  ${totalW} ${pillH}`,
    `L ${totalW} ${totalH - br}`,
    `Q ${totalW} ${totalH} ${totalW - br} ${totalH}`,
    `L ${br} ${totalH}`,
    `Q 0 ${totalH} 0 ${totalH - br}`,
    `L 0 ${pillH}`,
    `C 0 ${pillH - cs}  ${pLeft} ${pillH + cs}  ${pLeft} ${pillH}`,
    `L ${pLeft} ${pr}`,
    `Q ${pLeft} 0 ${pLeft + pr} 0`,
    `Z`,
  ].join(" ");
}

// ══ Toaster ──────────────────────────────────────────────────────────────────

interface ToasterProps {
  position?: ToasterPosition;
}

export function Toaster({ position = "bottom-right" }: ToasterProps) {
  const toasts = useToasts();
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        role="region"
        aria-label="Notificaciones"
        style={{
          position: "fixed",
          display: "flex",
          gap: "10px",
          zIndex: 9999,
          maxWidth: "440px",
          width: "max-content",
          ...getPositionStyle(position),
        }}
      >
        {toasts.map((t) => <ToastItem key={t.id} toast={t} position={position} />)}
      </div>
    </>
  );
}

// ══ Toast individual ─────────────────────────────────────────────────────────

function ToastItem({ toast: t, position }: { toast: Toast; position: ToasterPosition }) {
  const { color, Icon, spin } = TYPE_CONFIG[t.type];
  const animName = ANIMATIONS[t.animation ?? "slide"];

  const bg          = t.style?.bg           ?? "#ffffff";
  const borderColor = t.style?.borderColor;
  const borderWidth = t.style?.borderWidth  ?? 0;
  const borderRadius = t.style?.borderRadius ?? 9999;

  const hasDescription = Boolean(t.description);

  const side =
    position.endsWith("right") ? "right" :
    position.endsWith("left")  ? "left"  : "center";

  // Refs para el blob SVG — solo activos cuando hasDescription = true
  const wrapperRef = useRef<HTMLDivElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);
  const svgRef     = useRef<SVGSVGElement>(null);
  const pathRef    = useRef<SVGPathElement>(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !headerRef.current || !svgRef.current || !pathRef.current) return;

    // 1. Medir el header (pill) antes de restringir
    const hRect = headerRef.current.getBoundingClientRect();

    // 2. Limitar el body: pill + máx 100px a cada lado → forma compacta y proporcional
    const cap = Math.min(Math.max(hRect.width + 100, 300), 420);
    wrapperRef.current.style.maxWidth = cap + "px";

    // 3. Re-medir con la restricción aplicada (getBoundingClientRect fuerza el recálculo)
    const wRect = wrapperRef.current.getBoundingClientRect();
    const w = wRect.width;
    const h = wRect.height;

    // pillH = distancia desde el top del wrapper al bottom del header (incluye padding top)
    const pillH = hRect.bottom - wRect.top;

    const pillR = borderRadius >= 9999 ? 12 : borderRadius;
    const bodyR = borderRadius >= 9999 ? 18 : borderRadius;

    svgRef.current.setAttribute("width",   String(w));
    svgRef.current.setAttribute("height",  String(h));
    svgRef.current.setAttribute("viewBox", `0 0 ${w} ${h}`);
    pathRef.current.setAttribute("d",
      buildBlobPath(hRect.width, pillH, w, h, side, pillR, bodyR));
    pathRef.current.setAttribute("fill",         bg);
    pathRef.current.setAttribute("stroke",
      borderWidth > 0 && borderColor ? borderColor : `${color}22`);
    pathRef.current.setAttribute("stroke-width", String(borderWidth > 0 ? borderWidth : 1));
  });

  // ── Sin descripción: pill clásico ──────────────────────────────────────────
  const border = borderWidth > 0 && borderColor
    ? `${borderWidth}px solid ${borderColor}`
    : `1px solid ${color}22`;

  if (!hasDescription) {
    return (
      <div
        role="alert"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: bg,
          borderRadius: `${borderRadius}px`,
          border,
          padding: "11px 16px 11px 14px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
          animation: `${animName} 0.25s ease`,
          minWidth: "240px",
          maxWidth: "440px",
        }}
      >
        <span style={{ display: "flex", flexShrink: 0, animation: spin ? "alertmar-spin 1s linear infinite" : "none" }}>
          <Icon size={18} color={color} strokeWidth={2.2} />
        </span>
        <span style={{ fontSize: "14px", fontWeight: 500, color, flex: 1, lineHeight: "1.4", wordBreak: "break-word" }}>
          {t.message}
        </span>
        {t.dismissible && <DismissBtn id={t.id} />}
      </div>
    );
  }

  // ── Con descripción: shape SVG orgánica (estilo goey-toast) ──────────────
  // El wrapper mide la forma total; el SVG cubre todo el área.
  // El header es el "pill" compacto arriba; la descripción es el body abajo.
  return (
    <div
      ref={wrapperRef}
      role="alert"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: side === "right" ? "flex-end" : side === "left" ? "flex-start" : "center",
        minWidth: "300px",
        animation: `${animName} 0.25s ease`,
      }}
    >
      {/* SVG blob — background orgánico, se dibuja en useLayoutEffect */}
      <svg
        ref={svgRef}
        aria-hidden
        style={{
          position: "absolute",
          top: 0, left: 0,
          overflow: "visible",
          pointerEvents: "none",
          filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.11)) drop-shadow(0 1px 4px rgba(0,0,0,0.07))",
        }}
      >
        <path ref={pathRef} />
      </svg>

      {/* Header — medido como el "pill" del SVG */}
      <div
        ref={headerRef}
        style={{
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "9px 14px 8px 12px",
        }}
      >
        <span style={{ display: "flex", flexShrink: 0, animation: spin ? "alertmar-spin 1s linear infinite" : "none" }}>
          <Icon size={15} color={color} strokeWidth={2.3} />
        </span>
        <span style={{ fontSize: "13px", fontWeight: 700, color, whiteSpace: "nowrap" }}>
          {t.message}
        </span>
        {t.dismissible && <DismissBtn id={t.id} />}
      </div>

      {/* Body — descripción debajo del pill */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          alignSelf: "stretch",
          padding: "6px 16px 14px 14px",
        }}
      >
        <p style={{
          fontSize: "13px",
          color: "#4b5563",
          lineHeight: "1.6",
          margin: 0,
          wordBreak: "break-word",
          textAlign: side === "center" ? "center" : "left",
        }}>
          {t.description}
        </p>
      </div>
    </div>
  );
}

// ══ Botón cerrar reutilizable ────────────────────────────────────────────────

function DismissBtn({ id }: { id: string }) {
  return (
    <button
      aria-label="Cerrar"
      onClick={() => toast.dismiss(id)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "none", border: "none", cursor: "pointer",
        padding: "2px", borderRadius: "50%", flexShrink: 0,
        color: "#9ca3af", transition: "color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#374151")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
    >
      <X size={14} strokeWidth={2.5} />
    </button>
  );
}
