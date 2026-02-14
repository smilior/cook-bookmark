import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f97316",
          borderRadius: 102,
          fontSize: 340,
          lineHeight: 1,
        }}
      >
        🍳
      </div>
    ),
    { width: 512, height: 512 }
  );
}
