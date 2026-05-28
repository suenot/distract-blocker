export type Locale = "en" | "ru";

export interface SceneTiming {
  from: number;
  durationInFrames: number;
}

export interface LocaleConfig {
  audio: string;
  totalFrames: number;

  hook: {
    lines: [string, string, string];
  };
  overview: { caption: string; screenshot: string; pan: "in" | "out" };
  schedule: { caption: string; screenshot: string; pan: "in" | "out" };
  languages: { caption: string; screenshot: string; pan: "in" | "out" };
  privacy: { points: string[] };
  cta: { brand: string; button: string; domain: string };

  timings: {
    hook: SceneTiming;
    overview: SceneTiming;
    schedule: SceneTiming;
    languages: SceneTiming;
    privacy: SceneTiming;
    cta: SceneTiming;
  };
}

export const LOCALES: Record<Locale, LocaleConfig> = {
  en: {
    audio: "voiceover.wav",
    totalFrames: 1170,
    hook: {
      lines: ["Doom-scrolling.", "We all do it.", "We all wish we didn't."],
    },
    overview: {
      caption: "One side panel. One toggle. Your distractions, gone.",
      screenshot: "screenshots/01-overview-1280x800.png",
      pan: "in",
    },
    schedule: {
      caption: "Schedule by day and time. Block during work. Allow during breaks.",
      screenshot: "screenshots/02-schedule-1280x800.png",
      pan: "out",
    },
    languages: {
      caption: "21 languages. Auto-detected from your browser.",
      screenshot: "screenshots/04-languages-1280x800.png",
      pan: "in",
    },
    privacy: {
      points: [
        "No tracking",
        "No remote code",
        "No account",
        "Native Chrome rules",
        "MIT-licensed",
      ],
    },
    cta: {
      brand: "Distract Blocker",
      button: "Get it on the Chrome Web Store",
      domain: "distract-blocker.marketmaker.cc",
    },
    timings: {
      hook: { from: 0, durationInFrames: 120 },
      overview: { from: 120, durationInFrames: 330 },
      schedule: { from: 450, durationInFrames: 240 },
      languages: { from: 690, durationInFrames: 180 },
      privacy: { from: 870, durationInFrames: 180 },
      cta: { from: 1050, durationInFrames: 120 },
    },
  },

  ru: {
    audio: "voiceover-ru.wav",
    totalFrames: 1350,
    hook: {
      lines: ["Бесконечная лента.", "Все так делаем.", "И все хотим перестать."],
    },
    overview: {
      caption: "Одна панель. Один тоггл. Отвлечений больше нет.",
      screenshot: "screenshots/ru/01-overview-1280x800.png",
      pan: "in",
    },
    schedule: {
      caption: "Расписание по дням и часам. Блок в работу, свобода в перерыв.",
      screenshot: "screenshots/ru/02-schedule-1280x800.png",
      pan: "out",
    },
    languages: {
      caption: "21 язык. Определяется по браузеру.",
      screenshot: "screenshots/ru/04-languages-1280x800.png",
      pan: "in",
    },
    privacy: {
      points: [
        "Без трекинга",
        "Без удалённого кода",
        "Без аккаунта",
        "Нативные правила Chrome",
        "Лицензия MIT",
      ],
    },
    cta: {
      brand: "Distract Blocker",
      button: "Бери в Chrome Web Store",
      domain: "distract-blocker.marketmaker.cc",
    },
    timings: {
      hook: { from: 0, durationInFrames: 130 },
      overview: { from: 130, durationInFrames: 440 },
      schedule: { from: 570, durationInFrames: 240 },
      languages: { from: 810, durationInFrames: 210 },
      privacy: { from: 1020, durationInFrames: 230 },
      cta: { from: 1250, durationInFrames: 100 },
    },
  },
};
