import { useEffect, useState } from "react";
import Home from "../game/Home";
import "./Ranking.css";
import RankingFiltered from "./RankingFiltered";
import InitialScreen from "../init/InitialScreen";
import AppHeader from "../../components/AppHeader";

type RankingApiEntry = {
    username: string;
    value: number;
};

export default function Ranking({ username }: Readonly<{ username: string }>) {
    const [goBack, setGoBack] = useState(false);
    const [goFiltered, setGoFiltered] = useState(false);
    const [goLogin, setGoLogin] = useState(false);
    const [position, setPosition] = useState<number | null>(null);
    const [loadingPosition, setLoadingPosition] = useState(true);
    const [positionError, setPositionError] = useState(false);

    useEffect(() => {
        const obtenerPosicion = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL_WA ?? "http://localhost:3000";
                const res = await fetch(`${API_URL}/ranking/wins`); // GET sin body

                const data = await res.json();
                if (!res.ok || !Array.isArray(data.ranking)) {
                    throw new Error("Ranking no disponible");
                }

                const index = (data.ranking as RankingApiEntry[]).findIndex(
                    (entry) => entry.username === username
                );

                setPosition(index >= 0 ? index + 1 : null);
                setPositionError(false);
            } catch {
                setPosition(null);
                setPositionError(true);
            } finally {
                setLoadingPosition(false);
            }
        };

        obtenerPosicion();
    }, [username]);

    if (goLogin) return <InitialScreen />;
    if (goBack) return <Home username={username} />;
    if (goFiltered) return <RankingFiltered username={username} />;

    return (
        <div className="ranking-screen">
            <AppHeader onLogout={() => setGoLogin(true)} />
            <img className="ranking-logo" src="/yovi_logo.png" alt="YOVI Logo" />
            <h1 className="ranking-screen-title">Ranking global</h1>

            <div className="ranking-position-card">
                <p className="ranking-position-label">Tu posición en el ranking es...</p>
                {loadingPosition && <p className="ranking-position-value">...</p>}
                {!loadingPosition && !positionError && position !== null && (
                    <p className="ranking-position-value">#{position}</p>
                )}
                {!loadingPosition && !positionError && position === null && (
                    <p className="ranking-position-value">Sin posicion</p>
                )}
                {!loadingPosition && positionError && (
                    <p className="ranking-position-value">No disponible</p>
                )}
            </div>

            <div className="ranking-menu">
                <button className="ranking-btn-filtered" onClick={() => setGoFiltered(true)}>
                    Ver ranking
                </button>

                <button className="ranking-btn-menu" onClick={() => setGoBack(true)}>
                    Volver al menú principal
                </button>
            </div>
        </div>
    );
}