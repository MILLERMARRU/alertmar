import { useState } from "react";
import { useConfirm } from "./useConfirm";

export function ConfirmDialog() {
  const request = useConfirm();
  const [visible, setVisible] = useState(true);

  if (!request || !visible) return null;

  const { options, resolve } = request;

  function handleAnswer(value: boolean) {
    setVisible(false);
    resolve(value);
    // Resetea para próxima vez
    setTimeout(() => setVisible(true), 100);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2f2f2f",
          borderRadius: "14px",
          padding: "28px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}
      >
        <h2 style={{ fontSize: "17px", fontWeight: 600, marginBottom: "10px" }}>
          {options.title}
        </h2>

        {options.description && (
          <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "24px", lineHeight: 1.6 }}>
            {options.description}
          </p>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={() => handleAnswer(false)}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "1px solid #3f3f3f",
              background: "transparent",
              color: "#f0f0f0",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {options.cancelText ?? "Cancelar"}
          </button>
          <button
            onClick={() => handleAnswer(true)}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#ef4444",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {options.confirmText ?? "Confirmar"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
