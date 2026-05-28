import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { LOCALES, Locale } from "./locales";
import { Hook } from "./scenes/Hook";
import { ScreenshotScene } from "./scenes/ScreenshotScene";
import { Privacy } from "./scenes/Privacy";
import { CTA } from "./scenes/CTA";

export const FPS = 30;

export interface VideoProps {
  locale: Locale;
}

export const Video: React.FC<VideoProps> = ({ locale }) => {
  const cfg = LOCALES[locale];

  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0e11" }}>
      <Audio src={staticFile(cfg.audio)} />

      <Sequence
        from={cfg.timings.hook.from}
        durationInFrames={cfg.timings.hook.durationInFrames}
      >
        <Hook lines={cfg.hook.lines} />
      </Sequence>

      <Sequence
        from={cfg.timings.overview.from}
        durationInFrames={cfg.timings.overview.durationInFrames}
      >
        <ScreenshotScene
          caption={cfg.overview.caption}
          screenshot={cfg.overview.screenshot}
          pan={cfg.overview.pan}
        />
      </Sequence>

      <Sequence
        from={cfg.timings.schedule.from}
        durationInFrames={cfg.timings.schedule.durationInFrames}
      >
        <ScreenshotScene
          caption={cfg.schedule.caption}
          screenshot={cfg.schedule.screenshot}
          pan={cfg.schedule.pan}
        />
      </Sequence>

      <Sequence
        from={cfg.timings.languages.from}
        durationInFrames={cfg.timings.languages.durationInFrames}
      >
        <ScreenshotScene
          caption={cfg.languages.caption}
          screenshot={cfg.languages.screenshot}
          pan={cfg.languages.pan}
        />
      </Sequence>

      <Sequence
        from={cfg.timings.privacy.from}
        durationInFrames={cfg.timings.privacy.durationInFrames}
      >
        <Privacy points={cfg.privacy.points} />
      </Sequence>

      <Sequence
        from={cfg.timings.cta.from}
        durationInFrames={cfg.timings.cta.durationInFrames}
      >
        <CTA
          brand={cfg.cta.brand}
          button={cfg.cta.button}
          domain={cfg.cta.domain}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
