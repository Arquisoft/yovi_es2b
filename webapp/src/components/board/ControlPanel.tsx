interface ControlPanelProps {
  readonly onExit: () => void;
  readonly onUndo: () => void;
  readonly twoPlayers: boolean;
}

export default function ControlPanel({ onExit, onUndo, twoPlayers }: ControlPanelProps) {

  return (
    <div className="controls">
      {twoPlayers && <button id="undo-button" onClick={onUndo}>Deshacer movimiento</button>}
      <button id="exit-button" onClick={onExit}>Terminar partida</button>
    </div>
  );
}