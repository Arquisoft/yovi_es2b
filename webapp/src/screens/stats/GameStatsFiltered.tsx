import { useState } from "react";
import Home from "../game/Home.tsx";
import GameStats from "./GameStats.tsx";
import GameStatsDifficulty from "./GameStatsDifficuty.tsx";
import GameStatsStrategy from "./GameStatsStrategy.tsx";
import "./GameStats.css";

export default function GameStatsFiltered( {username} : { username: string }) {

    const [goBack, setGoBack] = useState(false);
    const [goHome, setGoHome] = useState(false);

    if (goBack) {
        return <GameStats username={username}/>;
    }
    if (goHome) {
        return <Home username={username}/>;
    }

    return (
        <div className="stats-screen-filter">
            <h2 className="stats-screen-filter-title">Estadísticas filtradas de:</h2>
            <h1 className="stats-total-screen-username">{username}</h1>

            <div className="stats-menu-filter">

                <div className="stats-menu-filter-strategy">
                    <GameStatsStrategy username={username}/>
                </div>

                <div className="stats-menu-filter-difficulty">
                    <GameStatsDifficulty username={username}/>
                </div>

                <br></br>
                <br></br>    
                
                <button className="stats-total-btn-back" onClick={() => setGoBack(true)}>
                    Volver al menú de estadísticas
                </button>

                <br></br> 

                <button className="stats-total-btn-home" onClick={() => setGoHome(true)}>
                    Volver al menú principal
                </button>
                
            </div>
            
        </div>
    );
}
