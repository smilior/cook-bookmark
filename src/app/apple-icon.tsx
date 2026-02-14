import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f97316",
          borderRadius: 36,
          fontSize: 120,
          lineHeight: 1,
        }}
      >
        🍳
      </div>
    ),
    { ...size }
  );
}
