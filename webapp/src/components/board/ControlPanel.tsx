interface ControlPanelProps {
  readonly onExit: () => void;
  readonly onUndo: () => void;
  readonly twoPlayers: boolean;
  readonly onlineMode?: boolean;
}

export default function ControlPanel({ onExit, onUndo, twoPlayers, onlineMode = false }: ControlPanelProps) {

  return (
    <div className="controls">
      {twoPlayers && !onlineMode && <button id="undo-button" onClick={onUndo}>Deshacer movimiento</button>}
      <button id="exit-button" onClick={onExit}>Terminar partida</button>
    </div>
  );
}