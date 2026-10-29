import { ImageResponse } from "next/og";

export const alt = "Brindo. Niente fila, solo la serata.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          background: "linear-gradient(135deg,#0a0a0c 55%,#2a2114)",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 40, color: "#d6b36a", letterSpacing: 6, textTransform: "uppercase" }}>Brindo</div>
        <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.05, marginTop: 24 }}>Niente fila,</div>
        <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.05, color: "#d6b36a" }}>solo la serata.</div>
        <div style={{ fontSize: 30, color: "#aaa", marginTop: 36 }}>Ordini digitali per discoteche e locali notturni</div>
      </div>
    ),
    size,
  );
}
