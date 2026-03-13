import { useState } from "react";

import { Game } from "./Game";
import type { GameSettings } from "../../gameOptions/GameSettings";
import { Strategy } from "../../gameOptions/Strategy";
import type { StrategyType } from "../../gameOptions/Strategy";
import { Difficulty } from "../../gameOptions/Difficulty";
import "./Home.css";
import InitialScreen from "../init/InitialScreen";

const yoviLogo = "/yovi_logo.png";

export default function HomePage( {username} : { username: string }) {
    const [settings, setSettings] = useState<GameSettings>({
        strategy: Strategy.RANDOM,
        difficulty: Difficulty.EASY
    });

    const [gameStarted, setGameStarted] = useState(false);
    const [menuSelected, setMenuSelected] = useState<string>("");
    const [logOut, setLogOut] = useState(false);

    function startGame() {
        setGameStarted(true);
    }

    // Si el juego ha empezado, renderizamos Game y le pasamos las settings
    if (gameStarted) {
        return <Game settings={settings} onBack={() => setGameStarted(false)} />;
    }

    if (logOut) {
        return <InitialScreen />;
    }

    /*
    <button className="home-menu__btn" onClick={() => setMenuSelected("Nueva partida")}>
                    Nueva partida
                </button>
    */

    return (
        <div className="home-screen">
            <img src={yoviLogo} alt="YOVI Logo" className="home-screen__logo" />
            <h2 className="home-screen__title">Bienvenido a tu menú principal, {username}</h2>

            

            {menuSelected && <p className="home-menu__selected">Seleccionado: {menuSelected}</p>}

            <div className="home-config">
                <button className="home-config__start" onClick={startGame}>
                    Empezar partida
                </button>

                <label className="home-config__label">Estrategia</label>
                <select
                    className="home-config__select"
                    value={settings.strategy}
                    onChange={(e) =>
                        setSettings({
                            ...settings,
                            strategy: e.target.value as StrategyType
                        })
                    }
                >
                    <option value={Strategy.RANDOM}>Random</option>
                    <option value={Strategy.DEFENSIVE}>Defensiva</option>
                    <option value={Strategy.OFFENSIVE}>Ofensiva</option>
                    <option value={Strategy.CENTER_FIRST}>Centro Primero</option>
                    <option value={Strategy.EDGE_FIRST}>Borde Primero</option>
                </select>

                <label className="home-config__label">Dificultad</label>
                <div className="home-difficulty">
                    <button
                        className={`home-difficulty__btn home-difficulty__btn--easy${settings.difficulty === Difficulty.EASY ? " home-difficulty__btn--active" : ""}`}
                        onClick={() => setSettings({ ...settings, difficulty: Difficulty.EASY })}>
                        Fácil
                    </button>
                    <button
                        className={`home-difficulty__btn home-difficulty__btn--medium${settings.difficulty === Difficulty.MEDIUM ? " home-difficulty__btn--active" : ""}`}
                        onClick={() => setSettings({ ...settings, difficulty: Difficulty.MEDIUM })}>
                        Media
                    </button>
                    <button
                        className={`home-difficulty__btn home-difficulty__btn--hard${settings.difficulty === Difficulty.HARD ? " home-difficulty__btn--active" : ""}`}
                        onClick={() => setSettings({ ...settings, difficulty: Difficulty.HARD })}>
                        Difícil
                    </button>
                </div>
                
            </div>

            <br></br>
            
            <div className="home-menu">
                <button className="home-menu__btn" onClick={() => setMenuSelected("Mis estadísticas")}>
                    Mis estadísticas
                </button>
                <button className="home-menu__btn" onClick={() => setMenuSelected("Ranking")}>
                    Ranking
                </button>
                <button className="home-menu-out__btn" onClick={() => setLogOut(true)}>
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}
