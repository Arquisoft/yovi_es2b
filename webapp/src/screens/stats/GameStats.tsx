import { useState } from "react";
import Home from "../game/Home.tsx";
import GameStatsTotal from "./GameStatsTotal.tsx";
import GameStatsFiltered from "./GameStatsFiltered.tsx";
import InitialScreen from "../init/InitialScreen.tsx";
import "./GameStats.css";
import AppHeader from "../../components/AppHeader";

export default function GameStats( {username} : { username: string }) {

    const [goBack, setGoBack] = useState(false);
    const [goTotal, setGoTotal] = useState(false);
    const [goFiltered, setGoFiltered] = useState(false);
    const [goLogin, setGoLogin] = useState(false);

    if (goLogin) return <InitialScreen />;
    if (goBack) return <Home username={username}/>;
    if (goTotal) {
        return <GameStatsTotal username={username}/>;
    }
    if (goFiltered) {
        return <GameStatsFiltered username={username}/>;
    }

    return (
        <div className="stats-screen">
            <AppHeader onLogout={() => setGoLogin(true)} />
            <h1 className="stats-screen-title">Eliga que estadísticas desea ver</h1>

            <div className="stats-menu">

                <button className="stats-btn-total" onClick={() => setGoTotal(true)}>
                    Ver todas las estadísticas
                </button>

                <button className="stats-btn-filt" onClick={() => setGoFiltered(true)}>
                    Ver estadísticas filtradas
                </button>

                <br></br> 
                
                <button className="stats-btn-back" onClick={() => setGoBack(true)}>
                    Volver al menú principal
                </button>
                
            </div>
            
        </div>
    );
}
