import { useRaffleStore } from "./store/raffleStore";
import { Masthead } from "./components/Masthead";
import { NamesPage } from "./pages/NamesPage";
import { WheelPage } from "./pages/WheelPage";
import { MagicBallPage } from "./pages/MagicBallPage";
import { DuelPage } from "./pages/DuelPage";
import { VerdictCertificate } from "./components/VerdictCertificate";
import { FullAutoOverlay } from "./components/FullAutoOverlay";

export default function App() {
  const step = useRaffleStore((s) => s.step);
  const winner = useRaffleStore((s) => s.winner);
  const verdict = useRaffleStore((s) => s.verdict);
  const mode = useRaffleStore((s) => s.mode);

  // Step 3 has two flavors. The oracle path is the original 8-ball and
  // requires a winner already chosen by the wheel. The duel path replaces
  // it entirely — there is no pre-picked winner, the duel resolves it.
  const showOracle = step === 3 && mode === "oracle" && winner;
  const showDuel = step === 3 && mode === "duel";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Masthead />
      {step === 1 && <NamesPage />}
      {step === 2 && <WheelPage />}
      {showOracle && <MagicBallPage />}
      {showDuel && <DuelPage />}
      {verdict && <VerdictCertificate />}
      <FullAutoOverlay />
    </div>
  );
}
