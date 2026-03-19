export default function ControlPanel({onExit} : { onExit: () => void }) {

  return (
    <div className="controls">
      <button id="exit-button" onClick={onExit}>Terminar partida</button>
    </div>
  );
}