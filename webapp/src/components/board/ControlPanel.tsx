interface ControlPanelProps {
  onExit: () => void;
  onRestart: () => void;
}

export default function ControlPanel({ onExit, onRestart }: ControlPanelProps) {

  return (
    <div className="controls">
      <button id="restart-button" onClick={onRestart}>Reiniciar partida</button>
      <button id="exit-button" onClick={onExit}>Terminar partida</button>
    </div>
  );
}