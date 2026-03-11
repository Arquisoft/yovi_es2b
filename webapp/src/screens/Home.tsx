import { useState } from "react";
import type { GameSettings } from "../gameOptions/GameSettings";
import { Strategy } from "../gameOptions/Strategy";
import type { StrategyType } from "../gameOptions/Strategy";
import { Difficulty } from "../gameOptions/Difficulty";
import { Game } from "./Game"; 
import "./Home.css";

export default function HomePage() {
    const [settings, setSettings] = useState<GameSettings>({
        strategy: Strategy.RANDOM,
        difficulty: Difficulty.EASY
    });

    const [gameStarted, setGameStarted] = useState(false);
    const [menuSelected, setMenuSelected] = useState<string>("");

    function startGame() {
        setGameStarted(true); // Cambiamos el estado para "navegar"    
    }

    // Si el juego ha empezado, renderizamos Game y le pasamos las settings
    if (gameStarted) {
        return <Game settings={settings} onBack={() => setGameStarted(false)} />;
    }

    return (
        <div className="home-container">
            <h1>YOVI</h1>
            <h2>La mejor versión del juego Y</h2>

            <div className="menu-buttons">
                <button onClick={() => setMenuSelected("Nueva partida")}>
                    Nueva partida
                </button>

                <button onClick={() => setMenuSelected("Ranking")}>
                    Ranking
                </button>

                <button onClick={() => setMenuSelected("Mis estadísticas")}>
                    Mis estadísticas
                </button>
            </div>

            {menuSelected && <p>Seleccionado: {menuSelected}</p>}

            <div className="config-box">
                <label>Estrategia</label>
                <select
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

                <label>Dificultad</label>
                <div>
                    {/* setSettings es la función de useState envargada de de cambiar el estado al hacer click en el boton.
             Se crea un nuevo objeto con los mismos valores que settings pero con difficulty cambiado a EASY. 
             Esto es necesario porque el estado es inmutable, no se puede modificar directamente, sino que se debe crear una nueva copia con los cambios.
            */  }
                    <button id="easy-difficulty" onClick={() => setSettings({ ...settings, difficulty: Difficulty.EASY })}>
                        Fácil
                    </button>
                    <button id="medium-difficulty" onClick={() => setSettings({ ...settings, difficulty: Difficulty.MEDIUM })}>
                        Media
                    </button>
                    <button id="hard-difficulty" onClick={() => setSettings({ ...settings, difficulty: Difficulty.HARD })}>
                        Difícil
                    </button>
                </div>

               <button id="start-game" onClick={startGame}>
                Empezar partida
            </button>
            </div>
        </div>
    );
}