import { Composition } from "remotion";
import { Video, FPS } from "./Video";
import { LOCALES } from "./locales";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="distract-blocker"
        component={Video}
        durationInFrames={LOCALES.en.totalFrames}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ locale: "en" as const }}
      />
      <Composition
        id="distract-blocker-ru"
        component={Video}
        durationInFrames={LOCALES.ru.totalFrames}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ locale: "ru" as const }}
      />
    </>
  );
};
