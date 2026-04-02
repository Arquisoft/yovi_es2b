interface ControlPanelProps {
  onExit: () => void;
}

export default function ControlPanel({ onExit }: ControlPanelProps) {

  return (
    <div className="controls">
      <button id="exit-button" onClick={onExit}>Terminar partida</button>
    </div>
  );
}