import { useEffect, useState } from "react";

import { Game } from "./Game";
import type { GameSettings } from "../../components/gameOptions/GameSettings";
import { Strategy } from "../../components/gameOptions/Strategy";
import type { StrategyType } from "../../components/gameOptions/Strategy";
import { Difficulty } from "../../components/gameOptions/Difficulty";
import type { DifficultyType } from "../../components/gameOptions/Difficulty";
import "./Home.css";
import InitialScreen from "../init/InitialScreen";
import GameStats from "../stats/GameStats";
import Ranking from "../ranking/Ranking";

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
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Network error', { cause: err });
    }
}

export default function HomePage( {username} : { username: string }) {
    const [settings, setSettings] = useState<GameSettings>({
        strategy: Strategy.MONTE_CARLO_ENDURECIDO,
        difficulty: Difficulty.MEDIUM
    });

    const [twoPlayersStarted, setTwoPlayersStarted] = useState(false);
    const [username2, setUsername2] = useState("");
    const [username2Error, setUsername2Error] = useState<string | null>(null);
    const [difficulty2, setDifficulty2] = useState<DifficultyType>(Difficulty.MEDIUM);
    const [screen, setScreen] = useState("home");

    // como es función async, llamamos useEffect
    useEffect(() => {
        if (screen==="game") {
            iniciarPartida(username, settings.strategy, settings.difficulty);
        }
    }, [screen]);

    // Si el juego ha empezado, renderizamos Game y le pasamos las settings y ahora el username
    if (twoPlayersStarted) {
        return <Game settings={{ ...settings, difficulty: difficulty2 }} username={username} username2={username2} twoPlayers={true} stateStart={true} onGoMenu={() => setTwoPlayersStarted(false)}/>;
    }

    if (screen==="game") {
        return (
            <Game
                settings={settings}
                username={username}
                username2=""
                twoPlayers={false}
                stateStart={true}
                onGoMenu={() => setScreen("home")}
                onPlayAgain={() => iniciarPartida(username, settings.strategy, settings.difficulty)}
            />
        );
    }

    if (screen==="login") {
        return (<InitialScreen />);
    }

    if (screen==="stats") {
        return (<GameStats username={username}/>);
    }

    if (screen === "ranking"){
        return <Ranking username={username} />;
    }


    return (
        <div className="home-screen">

            {/* Header */}
            <header className="home-header">
                <img src={yoviLogo} alt="YOVI Logo" className="home-header__logo" />
                <button className="home-menu-out__btn home-header__logout" onClick={() => setScreen("login")}>
                    Cerrar sesión
                </button>
            </header>

            {/* Contenido */}
            <div className="home-body">
                <img src={yoviLogo} alt="YOVI Logo" className="home-screen__logo" />
                <h2 className="home-screen__title">Bienvenido a tu menú principal, {username}</h2>

                <div className="home-panels">

                    {/* Panel VS Bot */}
                    <div className="home-config">
                        <span className="home-config__label home-config__label--section">Juega contra el bot</span>

                        <label className="home-config__label" htmlFor="estrategia">Estrategia</label>
                        <select
                            id="estrategia"
                            className="home-config__select"
                            value={settings.strategy}
                            onChange={(e) => setSettings({ ...settings, strategy: e.target.value as StrategyType })}
                        >
                            <option value={Strategy.RANDOM}>Random</option>
                            <option value={Strategy.DEFENSIVO}>Defensiva</option>
                            <option value={Strategy.OFENSIVO}>Ofensiva</option>
                            <option value={Strategy.MONTE_CARLO}>Monte Carlo</option>
                            <option value={Strategy.MONTE_CARLO_MEJORADO}>Monte Carlo Mejorado</option>
                            <option value={Strategy.MONTE_CARLO_ENDURECIDO}>Monte Carlo Endurecido</option>
                        </select>

                        <span className="home-config__label">Dificultad</span>
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

                        <button className="home-config__start" onClick={() => setScreen("game")}>
                            Empezar partida
                        </button>

                        <hr className="home-config__divider" />

                        <div className="home-menu">
                            <button className="home-menu__btn" onClick={() => setScreen("stats")}>
                                Mis estadísticas
                            </button>
                            <button className="home-menu__btn" onClick={() => setScreen("ranking")}>
                                Ranking
                            </button>
                        </div>
                    </div>

                    {/* Panel 2 Jugadores */}
                    <div className="home-config home-config--pvp">
                        <span className="home-config__label home-config__label--section">Partida de 2 Jugadores</span>

                        <label className="home-config__label" htmlFor="username2">Nombre del jugador 2</label>
                        <input
                            id="username2"
                            className="home-config__input"
                            type="text"
                            placeholder="Nombre del jugador 2"
                            value={username2}
                            onChange={(e) => { setUsername2(e.target.value); setUsername2Error(null); }}
                        />

                        <span className="home-config__label">Tamaño del tablero</span>
                        <div className="home-difficulty">
                            <button
                                className={`home-difficulty__btn home-difficulty__btn--easy${difficulty2 === Difficulty.EASY ? " home-difficulty__btn--easy--active" : ""}`}
                                onClick={() => setDifficulty2(Difficulty.EASY)}>
                                Pequeño
                            </button>
                            <button
                                className={`home-difficulty__btn home-difficulty__btn--medium${difficulty2 === Difficulty.MEDIUM ? " home-difficulty__btn--medium--active" : ""}`}
                                onClick={() => setDifficulty2(Difficulty.MEDIUM)}>
                                Mediano
                            </button>
                            <button
                                className={`home-difficulty__btn home-difficulty__btn--hard${difficulty2 === Difficulty.HARD ? " home-difficulty__btn--hard--active" : ""}`}
                                onClick={() => setDifficulty2(Difficulty.HARD)}>
                                Grande
                            </button>
                        </div>

                        <div className="home-config__spacer" />

                        {username2Error && (
                            <div style={{ color: 'red', fontSize: '0.85rem' }}>
                                {username2Error}
                            </div>
                        )}
                        <button
                            className="home-config__start"
                            onClick={() => {
                                if (username2.trim() === "") {
                                    setUsername2Error("El nombre del jugador 2 no puede estar vacío.");
                                    return;
                                }
                                setTwoPlayersStarted(true);
                            }}
                        >
                            Empezar partida 2 jugadores
                        </button>
                    </div>
            </div>
        </div>
    </div>
    );
}