import { useState } from "react";
import Home from "../game/Home.tsx";
import GameStatsTotal from "./GameStatsTotal.tsx";
import "./GameStats.css";

export default function GameStats( {username} : { username: string }) {

    const [goBack, setGoBack] = useState(false);
    const [goDifficulty, setGoDifficulty] = useState(false);
    const [goStrategy, setGoStrategy] = useState(false);
    const [goTotal, setGoTotal] = useState(false);

    if (goBack) {
        return <Home username={username}/>;
    }
    if (goTotal) {
        return <GameStatsTotal username={username}/>;
    }
    if (goDifficulty) {
        return <Home username={username}/>;
    }
    if (goStrategy) {
        return <Home username={username}/>;
    }


    return (
        <div className="stats-screen">
            <h2 className="stats-screen-title">Eliga que estadísticas desea ver</h2>

            <div className="stats-menu">

                <button className="stats-btn-total" onClick={() => setGoTotal(true)}>
                    Ver todas las estadísticas
                </button>

                <br></br>

                <button className="stats-btn-diff" onClick={() => setGoDifficulty(true)}>
                    Por dificultad
                </button>

                <br></br>

                <button className="stats-btn-strategy" onClick={() => setGoStrategy(true)}>
                    Por estrategia
                </button>

                <br></br>
                <br></br>    
                
                <button className="stats-btn-back" onClick={() => setGoBack(true)}>
                    Volver al menú principal
                </button>
                
            </div>
            
        </div>
    );
}
