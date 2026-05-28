import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Mascot } from "../components/Mascot";

const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

interface Props {
  lines: [string, string, string];
}

export const Hook: React.FC<Props> = ({ lines }) => {
  const f = useCurrentFrame();

  const opacities = [0, 18, 50, 85].map((start, i) =>
    i === 0
      ? 0
      : interpolate(f, [start, start + 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
  );
  const yShift = (start: number) =>
    interpolate(f, [start, start + 18], [16, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const mascotScale = interpolate(f, [0, 30], [0.85, 1], {
    extrapolateRight: "clamp",
  });
  const mascotOpacity = interpolate(f, [0, 24], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, #2a1418 0%, #0d0e11 70%)",
        fontFamily: FONT,
      }}
    >
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            transform: `scale(${mascotScale})`,
            opacity: mascotOpacity,
            marginBottom: 40,
          }}
        >
          <Mascot size={240} state="on" />
        </div>

        <div
          style={{
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontWeight: 800,
            fontSize: 96,
          }}
        >
          <div
            style={{
              opacity: opacities[1],
              transform: `translateY(${yShift(18)}px)`,
            }}
          >
            {lines[0]}
          </div>
          <div
            style={{
              opacity: opacities[2],
              transform: `translateY(${yShift(50)}px)`,
              color: "#9aa0aa",
              fontSize: 72,
              marginTop: 18,
              fontWeight: 700,
            }}
          >
            {lines[1]}
          </div>
          <div
            style={{
              opacity: opacities[3],
              transform: `translateY(${yShift(85)}px)`,
              color: "#ff7c7c",
              fontSize: 72,
              marginTop: 8,
              fontWeight: 700,
            }}
          >
            {lines[2]}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
