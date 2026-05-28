import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Mascot } from "../components/Mascot";

const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

export const CTA: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    f,
    [durationInFrames - 18, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  const scale = interpolate(f, [0, 30], [0.9, 1], { extrapolateRight: "clamp" });
  const buttonOpacity = interpolate(f, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const buttonY = interpolate(f, [40, 60], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 35%, #2a1418 0%, #0d0e11 70%)",
        fontFamily: FONT,
        opacity,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div style={{ transform: `scale(${scale})`, marginBottom: 40 }}>
        <Mascot size={220} state="on" />
      </div>

      <div
        style={{
          fontSize: 110,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          background: "linear-gradient(180deg, #ffffff 0%, #a8aab0 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Distract Blocker
      </div>

      <div
        style={{
          marginTop: 24,
          padding: "20px 44px",
          background: "#e63946",
          color: "#fff",
          borderRadius: 18,
          fontSize: 34,
          fontWeight: 700,
          opacity: buttonOpacity,
          transform: `translateY(${buttonY}px)`,
          boxShadow: "0 12px 32px rgba(230,57,70,0.4)",
        }}
      >
        Get it on the Chrome Web Store
      </div>

      <div
        style={{
          marginTop: 28,
          color: "#9aa0aa",
          fontSize: 22,
          fontFamily: "ui-monospace, Menlo, monospace",
          opacity: buttonOpacity,
        }}
      >
        distract-blocker.marketmaker.cc
      </div>
    </AbsoluteFill>
  );
};
