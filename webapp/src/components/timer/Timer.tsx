import { useEffect, useState } from "react";
import "./TurnTimer.css";

const TURN_SECONDS = 15;

interface TurnTimerProps {
  turno: string;    // cambia con cada turno, dispara el reset
  onExpire: () => void; // se llama cuando el tiempo llega a 0
}

// Temporizador para cada turno, se reinicia con cada cambio de turno y llama a onExpire cuando se acaba el tiempo
// Readonly props para evitar modificaciones accidentales desde dentro del componente
export default function TurnTimer({ turno, onExpire }: Readonly<TurnTimerProps>) {
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);

  useEffect(() => {
    setTimeLeft(TURN_SECONDS);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [turno]);

  const isWarning = timeLeft <= 5;
  const isCritical = timeLeft <= 3;

  const className = [
    "turn-timer",
    isWarning ? "turn-timer--warning" : "",
    isCritical ? "turn-timer--critical" : "",
  ]
    .filter(Boolean) // Elimina clases vacías. Necesario para evitar espacios extra en el className final.
    .join(" ");

  return (
    <div className={className} role="timer" aria-label={`${timeLeft} segundos restantes`}>
      {timeLeft}s
    </div>
  );
}
