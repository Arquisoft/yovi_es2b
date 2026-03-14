import { useState } from "react";
import Home from "../../screens/game/Home";

export default function ControlPanel({username} : { username: string }) {
  const [end, setEnd] = useState(false);

  if(end) {
    return (<Home username={username}/>);
  };

  return (
    <div className="controls">
      <button id="exit-button" onClick={() => setEnd(true)}>Terminar partida</button>
    </div>
  );
}