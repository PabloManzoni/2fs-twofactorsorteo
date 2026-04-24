import { useRaffleStore } from "./store/raffleStore";
import { Masthead } from "./components/Masthead";
import { NamesPage } from "./pages/NamesPage";
import { WheelPage } from "./pages/WheelPage";
import { MagicBallPage } from "./pages/MagicBallPage";
import { ConfirmedModal } from "./components/ConfirmedModal";

export default function App() {
  const step = useRaffleStore((s) => s.step);
  const winner = useRaffleStore((s) => s.winner);
  const confirmed = useRaffleStore((s) => s.confirmed);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Masthead />
      {step === 1 && <NamesPage />}
      {step === 2 && <WheelPage />}
      {step === 3 && winner && <MagicBallPage />}
      {confirmed && <ConfirmedModal />}
    </div>
  );
}
