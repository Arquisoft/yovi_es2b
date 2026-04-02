interface ControlPanelProps {
  onExit: () => void;
  onUndo: () => void;
}

export default function ControlPanel({ onExit, onUndo }: ControlPanelProps) {

  return (
    <div className="controls">
      <button id="undo-button" onClick={onUndo}>Deshacer movimiento</button>
      <button id="exit-button" onClick={onExit}>Terminar partida</button>
    </div>
  );
}