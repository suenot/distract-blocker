import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

interface Props {
  screenshot: string;
  caption: string;
  // optional pan: 'in' (zoom in), 'out' (zoom out)
  pan?: "in" | "out";
}

export const ScreenshotScene: React.FC<Props> = ({
  screenshot,
  caption,
  pan = "in",
}) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Crossfade in/out
  const fadeIn = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    f,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  // Ken Burns scale over duration
  const scaleStart = pan === "in" ? 1.0 : 1.08;
  const scaleEnd = pan === "in" ? 1.08 : 1.0;
  const scale = interpolate(f, [0, durationInFrames], [scaleStart, scaleEnd]);

  // Caption rise + fade
  const captionOpacity = interpolate(
    f,
    [4, 18, durationInFrames - 18, durationInFrames - 6],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const captionY = interpolate(f, [4, 18], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0e11", opacity }}>
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(screenshot)}
          style={{
            width: 1664,
            height: 1040,
            transform: `scale(${scale})`,
            borderRadius: 24,
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}
        />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 56,
          textAlign: "center",
          fontFamily: FONT,
          opacity: captionOpacity,
          transform: `translateY(${captionY}px)`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "14px 28px",
            background: "rgba(13,14,17,0.85)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            color: "#fff",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            backdropFilter: "blur(8px)",
          }}
        >
          {caption}
        </span>
      </div>
    </AbsoluteFill>
  );
};
