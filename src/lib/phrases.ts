import type { TFunction } from "i18next";
import type { MagicBallAnswer } from "../components/MagicBall/MagicBall";

/**
 * Deterministic binary oracle: fate says yes or no. No "maybe" — the ball
 * does not equivocate.
 */
const ANSWER_KEYS: { key: string; tone: "yes" | "no" }[] = [
  { key: "step3.answers.yes.noDoubt", tone: "yes" },
  { key: "step3.answers.yes.itIsCertain", tone: "yes" },
  { key: "step3.answers.yes.yesDefinitely", tone: "yes" },
  { key: "step3.answers.yes.youCanRely", tone: "yes" },
  { key: "step3.answers.yes.asISeeIt", tone: "yes" },
  { key: "step3.answers.yes.mostLikely", tone: "yes" },
  { key: "step3.answers.yes.goodOutlook", tone: "yes" },
  { key: "step3.answers.yes.signsPoint", tone: "yes" },
  { key: "step3.answers.no.dontCount", tone: "no" },
  { key: "step3.answers.no.replyNo", tone: "no" },
  { key: "step3.answers.no.sourcesSayNo", tone: "no" },
  { key: "step3.answers.no.outlookNotGood", tone: "no" },
  { key: "step3.answers.no.veryDoubtful", tone: "no" },
];

/**
 * The one thing you ask the ball. There used to be a second, inverted
 * phrasing ("does it cast X out?") but offering a choice implied the user
 * steered the outcome — so there is exactly one question now.
 */
export function buildQuestion(t: TFunction, name: string): string {
  const first = name.split(" ")[0] ?? name;
  return t("step3.question", { name: first });
}

export function pickAnswer(t: TFunction): MagicBallAnswer {
  const { key, tone } = ANSWER_KEYS[Math.floor(Math.random() * ANSWER_KEYS.length)];
  return { text: t(key), tone };
}
