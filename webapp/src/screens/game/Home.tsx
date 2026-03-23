import { useEffect, useState } from "react";

import { Game } from "./Game";
import type { GameSettings } from "../../gameOptions/GameSettings";
import { Strategy } from "../../gameOptions/Strategy";
import type { StrategyType } from "../../gameOptions/Strategy";
import { Difficulty } from "../../gameOptions/Difficulty";
import "./Home.css";
import InitialScreen from "../init/InitialScreen";
import GameStats from "../stats/GameStats";

const yoviLogo = "/yovi_logo.png";

/**
 * Declaración primera de esto, para que funcione el guardar datos de la partida
 */
async function iniciarPartida(username: string, strategy: string, difficulty: string) {
    try {
        const API_URL = import.meta.env.VITE_API_URL_WA ?? 'http://localhost:3000'
        const res = await fetch(`${API_URL}/initmatch`, {
            method: 'POST', headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, strategy, difficulty })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Server error');
        }
    } catch (err: any) {
        throw new Error(err.message || 'Network error');
    }
}

export default function HomePage( {username} : { username: string }) {
    const [settings, setSettings] = useState<GameSettings>({
        strategy: Strategy.RANDOM,
        difficulty: Difficulty.EASY
    });

    const [menuSelected, setMenuSelected] = useState<string>("");
    const [screen, setScreen] = useState("home");

    // como es función async, llamamos useEffect
    useEffect(() => {
        if (screen==="game") {
            iniciarPartida(username, settings.strategy, settings.difficulty);
        }
    }, [screen]);

    // Si el juego ha empezado, renderizamos Game y le pasamos las settings y ahora el username
    if (screen==="game") {
        return (
            <Game
                settings={settings}
                username={username}
                stateStart={true}
                onGoMenu={() => setScreen("home")}
            />
        );
    }

    if (screen==="login") {
        return (<InitialScreen />);
    }

    if (screen==="stats") {
        return (<GameStats username={username}/>);
    }


    return (
        <div className="home-screen">
            <img src={yoviLogo} alt="YOVI Logo" className="home-screen__logo" />
            <h2 className="home-screen__title">Bienvenido a tu menú principal, {username}</h2>
            

            {menuSelected && <p className="home-menu__selected">Seleccionado: {menuSelected}</p>}

            <div className="home-config">
                <button className="home-config__start" onClick={() => setScreen("game")}>
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
                    <option value={Strategy.DEFENSIVO}>Defensiva</option>
                    <option value={Strategy.OFENSIVO}>Ofensiva</option>
                    <option value={Strategy.MONTE_CARLO}>Monte Carlo</option>
                    <option value={Strategy.MONTE_CARLO_MEJORADO}>Monte Carlo Mejorado</option>
                    <option value={Strategy.MONTE_CARLO_ENDURECIDO}>Monte Carlo Endurecido</option>
                </select>

                <label className="home-config__label">Dificultad</label>
                <div className="home-difficulty">
                    <button
                        className={`home-difficulty__btn home-difficulty__btn--easy${settings.difficulty === Difficulty.EASY ? " home-difficulty__btn--easy--active" : ""}`}
                        onClick={() => setSettings({ ...settings, difficulty: Difficulty.EASY })}>
                        Fácil
                    </button>
                    <button
                        className={`home-difficulty__btn home-difficulty__btn--medium${settings.difficulty === Difficulty.MEDIUM ? " home-difficulty__btn--medium--active" : ""}`}
                        onClick={() => setSettings({ ...settings, difficulty: Difficulty.MEDIUM })}>
                        Media
                    </button>
                    <button
                        className={`home-difficulty__btn home-difficulty__btn--hard${settings.difficulty === Difficulty.HARD ? " home-difficulty__btn--hard--active" : ""}`}
                        onClick={() => setSettings({ ...settings, difficulty: Difficulty.HARD })}>
                        Difícil
                    </button>
                </div>
                
            </div>

            <br></br>
            
            <div className="home-menu">
                <button className="home-menu__btn" onClick={() => setScreen("stats")}>
                    Mis estadísticas
                </button>
                <button className="home-menu__btn" onClick={() => setMenuSelected("Ranking")}>
                    Ranking
                </button>
                <button className="home-menu-out__btn" onClick={() => setScreen("login")}>
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}
