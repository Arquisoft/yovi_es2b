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
import CreateRoom from "../lobby/CreateRoom";
import JoinRoom from "../lobby/JoinRoom";
import type { OnlineGameInfo } from "../lobby/OnlineGameInfo";
import AppHeader from "../../components/header/AppHeader";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";

/**
 * Declaración primera de esto, para que funcione el guardar datos de la partida
 */
async function iniciarPartida(username: string, strategy: string, difficulty: string, t: (key: string) => string) {
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
            throw new Error(data.error || t("error.serverError"));
        }
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : t("error.networkError"), { cause: err });
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
    const [timerEnabled2, setTimerEnabled2] = useState(true);
    const [screen, setScreen] = useState("home");
    const [onlineGameInfo, setOnlineGameInfo] = useState<OnlineGameInfo | null>(null);
    const { t } = useLanguageContext();

    // como es función async, llamamos useEffect
    useEffect(() => {
        if (screen==="game") {
            iniciarPartida(username, settings.strategy, settings.difficulty, t);
        }
    }, [screen]);

    // Partida online lista: ambos jugadores conectados
    if (onlineGameInfo) {
        const { gameId, code, playerIndex, opponentUsername, difficulty, timerEnabled } = onlineGameInfo;
        return (
            <Game
                settings={{ strategy: Strategy.MONTE_CARLO_ENDURECIDO, difficulty: difficulty as DifficultyType }}
                username={username}
                username2={opponentUsername}
                twoPlayers={true}
                stateStart={true}
                enableTimer={timerEnabled}
                onlineMode={true}
                roomCode={code}
                localPlayerIndex={playerIndex}
                initialGameId={gameId}
                onGoMenu={() => setOnlineGameInfo(null)}
            />
        );
    }

    // Pantallas de lobby online
    if (screen === "online-create") {
        return (
            <CreateRoom
                username={username}
                onGameReady={(info) => { setScreen("home"); setOnlineGameInfo(info); }}
                onBack={() => setScreen("home")}
            />
        );
    }

    if (screen === "online-join") {
        return (
            <JoinRoom
                username={username}
                onGameReady={(info) => { setScreen("home"); setOnlineGameInfo(info); }}
                onBack={() => setScreen("home")}
            />
        );
    }

    // Si el juego ha empezado, renderizamos Game y le pasamos las settings y ahora el username
    if (twoPlayersStarted) {
        return <Game settings={{ ...settings, difficulty: difficulty2 }} username={username} username2={username2} twoPlayers={true} stateStart={true} enableTimer={timerEnabled2} onGoMenu={() => setTwoPlayersStarted(false)}/>;
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
                onPlayAgain={() => iniciarPartida(username, settings.strategy, settings.difficulty, t)}
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
            <AppHeader onLogout={() => setScreen("login")} />

            {/* Contenido */}
            <div className="home-body">
                <img src="/yovi_logo.png" alt={t("common.logoAlt")} className="home-screen__logo" />
                <h2 className="home-screen__title">{t("home.welcome")}, {username}</h2>

                <div className="home-panels">

                    {/* Panel VS Bot */}
                    <div className="home-config">
                        <span className="home-config__label home-config__label--section">{t("home.vsBot")}</span>

                        <label className="home-config__label" htmlFor="estrategia">{t("home.strategy")}</label>
                        <select
                            id="estrategia"
                            className="home-config__select"
                            value={settings.strategy}
                            onChange={(e) => setSettings({ ...settings, strategy: e.target.value as StrategyType })}
                        >
                            <option value={Strategy.RANDOM}>{t("home.botRandom")}</option>
                            <option value={Strategy.DEFENSIVO}>{t("home.botDefensive")}</option>
                            <option value={Strategy.OFENSIVO}>{t("home.botOffensive")}</option>
                            <option value={Strategy.MONTE_CARLO}>{t("home.botMC")}</option>
                            <option value={Strategy.MONTE_CARLO_MEJORADO}>{t("home.botMCBetter")}</option>
                            <option value={Strategy.MONTE_CARLO_ENDURECIDO}>{t("home.botMCHard")}</option>
                            {/* <option value={Strategy.MONTE_CARLO_ENDURECIDO_CONCURSO}>Monte Carlo Endurecido Concurso</option> */}
                        </select>

                        <span className="home-config__label">{t("home.difficulty")}</span>
                        <div className="home-difficulty">
                            <button
                                className={`home-difficulty__btn home-difficulty__btn--easy${settings.difficulty === Difficulty.EASY ? " home-difficulty__btn--easy--active" : ""}`}
                                onClick={() => setSettings({ ...settings, difficulty: Difficulty.EASY })}>
                                {t("home.easybutton")}
                            </button>
                            <button
                                className={`home-difficulty__btn home-difficulty__btn--medium${settings.difficulty === Difficulty.MEDIUM ? " home-difficulty__btn--medium--active" : ""}`}
                                onClick={() => setSettings({ ...settings, difficulty: Difficulty.MEDIUM })}>
                                {t("home.mediumbutton")}
                            </button>
                            <button
                                className={`home-difficulty__btn home-difficulty__btn--hard${settings.difficulty === Difficulty.HARD ? " home-difficulty__btn--hard--active" : ""}`}
                                onClick={() => setSettings({ ...settings, difficulty: Difficulty.HARD })}>
                                {t("home.hardbutton")}
                            </button>
                        </div>

                        <button className="home-config__start" onClick={() => setScreen("game")}>
                            {t("home.startmatchBot")}
                        </button>

                        <hr className="home-config__divider" />

                        <div className="home-menu">
                            <button className="home-menu__btn" onClick={() => setScreen("stats")}>
                                {t("home.stats")}
                            </button>
                            <button className="home-menu__btn" onClick={() => setScreen("ranking")}>
                                {t("home.rank")}
                            </button>
                        </div>
                    </div>

                    {/* Panel 2 Jugadores Local */}
                    <div className="home-config home-config--pvp">
                        <span className="home-config__label home-config__label--section">{t("home.vsLocal")}</span>

                        <label className="home-config__label" htmlFor="username2">{t("home.player2")}</label>
                        <input
                            id="username2"
                            className="home-config__input"
                            type="text"
                            placeholder={t("home.player2")}
                            value={username2}
                            onChange={(e) => { setUsername2(e.target.value); setUsername2Error(null); }}
                        />

                        <span className="home-config__label">{t("home.boardSize")}</span>
                        <div className="home-difficulty">
                            <button
                                className={`home-difficulty__btn home-difficulty__btn--easy${difficulty2 === Difficulty.EASY ? " home-difficulty__btn--easy--active" : ""}`}
                                onClick={() => setDifficulty2(Difficulty.EASY)}>
                                {t("home.boardsmall")}
                            </button>
                            <button
                                className={`home-difficulty__btn home-difficulty__btn--medium${difficulty2 === Difficulty.MEDIUM ? " home-difficulty__btn--medium--active" : ""}`}
                                onClick={() => setDifficulty2(Difficulty.MEDIUM)}>
                                {t("home.boardmedium")}
                            </button>
                            <button
                                className={`home-difficulty__btn home-difficulty__btn--hard${difficulty2 === Difficulty.HARD ? " home-difficulty__btn--hard--active" : ""}`}
                                onClick={() => setDifficulty2(Difficulty.HARD)}>
                                {t("home.boardlarge")}
                            </button>
                        </div>

                        <span className="home-config__label">{t("home.timer")}</span>
                        <label className="home-toggle" htmlFor="timer-enabled-2p">
                            <span className="home-toggle__text">{t("home.activateTimer")}</span>
                            <span className="home-toggle__control">
                                <input
                                    id="timer-enabled-2p"
                                    className="home-toggle__input"
                                    type="checkbox"
                                    checked={timerEnabled2}
                                    onChange={(e) => setTimerEnabled2(e.target.checked)}
                                />
                                <span className="home-toggle__slider" aria-hidden="true" />
                            </span>
                        </label>

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
                                    setUsername2Error(t("error.player2unfilled"));
                                    return;
                                }
                                setTwoPlayersStarted(true);
                            }}
                        >
                            {t("home.startmatchLocal")}
                        </button>
                    </div>

                    {/* Panel Online */}
                    <div className="home-config home-config--online">
                        <span className="home-config__label home-config__label--section">{t("home.vsOnline")}</span>
                        <p className="home-config__online-desc">
                            {t("home.onlinedescription")}
                        </p>

                        <div className="home-config__spacer" />

                        <button
                            className="home-config__start"
                            onClick={() => setScreen("online-create")}
                        >
                            {t("home.create")}
                        </button>

                        <button
                            className="home-menu__btn"
                            onClick={() => setScreen("online-join")}
                        >
                            {t("home.join")}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
