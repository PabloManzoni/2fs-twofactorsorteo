import { useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  MAX_PARTICIPANTS,
  MIN_PARTICIPANTS,
  useRaffleStore,
} from "../store/raffleStore";
import { Button } from "../components/ui/Button";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Avatar } from "../components/ui/Avatar";
import { TicketPerforation } from "../components/ui/TicketPerforation";

export function NamesPage() {
  const { t } = useTranslation();
  const names = useRaffleStore((s) => s.names);
  const addName = useRaffleStore((s) => s.addName);
  const removeName = useRaffleStore((s) => s.removeName);
  const goStep = useRaffleStore((s) => s.goStep);

  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const atMax = names.length >= MAX_PARTICIPANTS;
  const canProceed = names.length >= MIN_PARTICIPANTS;

  const submit = () => {
    const result = addName(value);
    if (!result.ok) {
      if (result.error === "duplicate") setValue("");
      return;
    }
    setValue("");
    inputRef.current?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <main className="page">
      <div className="page__inner" style={{ maxWidth: 960 }}>
        <Eyebrow style={{ marginBottom: 14 }}>{t("step1.eyebrow")}</Eyebrow>
        <h1
          className="display-xl"
          dangerouslySetInnerHTML={{ __html: t("step1.heading") }}
        />
        <p className="lede">{t("step1.subtitle")}</p>

        <div className="grid-two">
          {/* LEFT — input */}
          <div>
            <Eyebrow style={{ marginBottom: 10 }}>{t("step1.addParticipant")}</Eyebrow>
            <div className="names-form" style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKey}
                placeholder={t("step1.inputPlaceholder")}
                disabled={atMax}
                maxLength={40}
                style={{
                  flex: 1,
                  fontFamily: "var(--font-ui)",
                  fontSize: 17,
                  padding: "14px 16px",
                  border: "1.5px solid var(--fg)",
                  background: "var(--surface)",
                  color: "var(--fg)",
                  borderRadius: "var(--r-md)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <Button
                variant="secondary"
                size="lg"
                onClick={submit}
                disabled={!value.trim() || atMax}
                className="btn-add"
              >
                + {t("step1.add")}
              </Button>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--fg-subtle)",
                letterSpacing: "0.04em",
              }}
            >
              {t("step1.enterHint", { current: names.length, max: MAX_PARTICIPANTS })}
            </div>

            <div style={{ marginTop: 40 }}>
              <div
                style={{
                  border: "1px solid var(--rule)",
                  background: "var(--surface)",
                  padding: "20px 24px",
                  position: "relative",
                }}
              >
                <Eyebrow style={{ marginBottom: 8 }}>{t("step1.houseRule")}</Eyebrow>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 18,
                    color: "var(--fg)",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                  dangerouslySetInnerHTML={{ __html: t("step1.houseRuleBody") }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — list */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Eyebrow>{t("step1.inTheUrn")}</Eyebrow>
              <span
                className="num"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  color: "var(--accent)",
                }}
              >
                {String(names.length).padStart(2, "0")} / {MAX_PARTICIPANTS}
              </span>
            </div>

            <div
              style={{
                border: "1px solid var(--ink-900)",
                background: "var(--surface)",
                minHeight: 360,
                position: "relative",
              }}
            >
              <TicketPerforation count={28} />
              {names.length === 0 ? (
                <div
                  style={{
                    padding: "60px 32px",
                    textAlign: "center",
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 20,
                    color: "var(--fg-subtle)",
                  }}
                >
                  {t("step1.emptyTitle")}
                  <br />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontStyle: "normal",
                      fontSize: 12,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--fg-muted)",
                    }}
                  >
                    {t("step1.emptyHint")}
                  </span>
                </div>
              ) : (
                <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {names.map((p, i) => (
                    <li
                      key={p}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 20px",
                        borderBottom:
                          i < names.length - 1 ? "1px solid var(--rule)" : "none",
                      }}
                    >
                      <span
                        className="num"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--fg-muted)",
                          width: 22,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Avatar name={p} size={32} />
                      <span
                        style={{
                          flex: 1,
                          fontFamily: "var(--font-ui)",
                          fontSize: 16,
                          fontWeight: 500,
                        }}
                      >
                        {p}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeName(p)}
                        title={t("step1.remove", { name: p })}
                        aria-label={t("step1.remove", { name: p })}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "var(--font-mono)",
                          fontSize: 18,
                          color: "var(--fg-muted)",
                          padding: "4px 8px",
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => goStep(2)}
                disabled={!canProceed}
                style={{ fontSize: 17, padding: "16px 32px" }}
              >
                {t("step1.cta")} <span style={{ fontSize: 20, marginLeft: 2 }}>→</span>
              </Button>
            </div>
            {!canProceed && (
              <div
                style={{
                  marginTop: 10,
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  letterSpacing: "0.04em",
                  color: "var(--fg-subtle)",
                }}
              >
                {t("step1.minHint", { min: MIN_PARTICIPANTS })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
