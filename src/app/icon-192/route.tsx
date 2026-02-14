import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f97316",
          borderRadius: 38,
          fontSize: 128,
          lineHeight: 1,
        }}
      >
        🍳
      </div>
    ),
    { width: 192, height: 192 }
  );
}
