import { useEffect, useState } from "react";
import "./Timer.css";

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
    // Configura un intervalo que se ejecuta cada segundo para decrementar el tiempo restante
    const interval = setInterval(() => 
        {
            setTimeLeft((prev) => prev - 1);
        }, 1000
    );
    // Limpia el intervalo cuando el componente se desmonta o cuando cambia el turno para evitar múltiples intervalos activos
    return () => clearInterval(interval);
  }, [turno]);

  useEffect(() => {
    if (timeLeft === 0) onExpire();
  }, [timeLeft]);

  let modifier = "";
  if (timeLeft <= 3) {
    modifier = "turn-timer--critical";
  } else if (timeLeft <= 5) {
    modifier = "turn-timer--warning";
  }

  return (
    <div className={`turn-timer ${modifier}`} role="timer" aria-label={`${timeLeft} segundos restantes`}>
      {timeLeft}s
    </div>
  );
}
