import type { TFunction } from "i18next";
import type { MagicBallAnswer } from "../components/MagicBall/MagicBall";

export const QUESTION_KEYS = [
  "step3.questions.shouldBeChosen",
  "step3.questions.destinyWants",
  "step3.questions.houseApproves",
] as const;

export type QuestionKey = (typeof QUESTION_KEYS)[number];

const ANSWER_TONES = {
  yes: [
    "step3.answers.yes.noDoubt",
    "step3.answers.yes.itIsCertain",
    "step3.answers.yes.yesDefinitely",
    "step3.answers.yes.youCanRely",
    "step3.answers.yes.asISeeIt",
    "step3.answers.yes.mostLikely",
    "step3.answers.yes.goodOutlook",
    "step3.answers.yes.signsPoint",
  ],
  maybe: [
    "step3.answers.maybe.hazy",
    "step3.answers.maybe.askAgainLater",
    "step3.answers.maybe.betterNotNow",
    "step3.answers.maybe.cannotPredict",
    "step3.answers.maybe.concentrate",
  ],
  no: [
    "step3.answers.no.dontCount",
    "step3.answers.no.replyNo",
    "step3.answers.no.sourcesSayNo",
    "step3.answers.no.outlookNotGood",
    "step3.answers.no.veryDoubtful",
  ],
} as const;

const ALL_ANSWERS: { key: string; tone: "yes" | "no" | "maybe" }[] = [
  ...ANSWER_TONES.yes.map((key) => ({ key, tone: "yes" as const })),
  ...ANSWER_TONES.maybe.map((key) => ({ key, tone: "maybe" as const })),
  ...ANSWER_TONES.no.map((key) => ({ key, tone: "no" as const })),
];

export function buildQuestions(t: TFunction, name: string): { key: QuestionKey; text: string }[] {
  const first = name.split(" ")[0] ?? name;
  return QUESTION_KEYS.map((key) => ({ key, text: t(key, { name: first }) }));
}

export function pickAnswer(t: TFunction): MagicBallAnswer {
  const { key, tone } = ALL_ANSWERS[Math.floor(Math.random() * ALL_ANSWERS.length)];
  return { text: t(key), tone };
}
