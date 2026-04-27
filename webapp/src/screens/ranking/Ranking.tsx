import { useEffect, useState } from "react";
import Home from "../game/Home";
import "./Ranking.css";
import RankingFiltered from "./RankingFiltered";
import InitialScreen from "../init/InitialScreen";
import AppHeader from "../../components/header/AppHeader";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";

type RankingApiEntry = {
    username: string;
    value: number;
    percentage?: string | number;
};

export default function Ranking({ username }: Readonly<{ username: string }>) {
    const [goBack, setGoBack] = useState(false);
    const [goFiltered, setGoFiltered] = useState(false);
    const [goLogin, setGoLogin] = useState(false);
    const [position, setPosition] = useState<number | null>(null);
    const [loadingPosition, setLoadingPosition] = useState(true);
    const [positionError, setPositionError] = useState(false);
    const { t } = useLanguageContext();

    useEffect(() => {
        const obtenerPosicion = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL_WA ?? "http://localhost:3000";
                const res = await fetch(`${API_URL}/ranking/wins`); // GET sin body

                const data = await res.json();
                if (!res.ok || !Array.isArray(data.ranking)) {
                    throw new Error(t("error.rankingError"));
                }

                const entries = data.ranking as RankingApiEntry[];
                const positions: number[] = [];
                for (let i = 0; i < entries.length; i++) {
                    let pos: number;
                    if (i === 0) {
                        pos = 1;
                    } else {
                        const prev = entries[i - 1];
                        const sameValue = entries[i].value === prev.value;
                        const samePct = String(entries[i].percentage ?? "0").replace("%", "") === String(prev.percentage ?? "0").replace("%", "");
                        pos = (sameValue && samePct) ? positions[i - 1] : i + 1;
                    }
                    positions.push(pos);
                }

                const index = entries.findIndex((entry) => entry.username === username);
                setPosition(index >= 0 ? positions[index] : null);
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
            <img className="ranking-logo" src="/yovi_logo.png" alt={t("common.logoAlt")} />
            <h1 className="ranking-screen-title">{t("ranking.title")}</h1>

            <div className="ranking-position-card">
                <p className="ranking-position-label">{t("ranking.position")}</p>
                {loadingPosition && <p className="ranking-position-value">...</p>}
                {!loadingPosition && !positionError && position !== null && (
                    <p className="ranking-position-value">#{position}</p>
                )}
                {!loadingPosition && !positionError && position === null && (
                    <p className="ranking-position-value">{t("ranking.noposition")}</p>
                )}
                {!loadingPosition && positionError && (
                    <p className="ranking-position-value">{t("ranking.notavailable")}</p>
                )}
            </div>

            <div className="ranking-menu">
                <button className="ranking-btn-filtered" onClick={() => setGoFiltered(true)}>
                    {t("ranking.seerank")}
                </button>

                <button className="ranking-btn-menu" onClick={() => setGoBack(true)}>
                    {t("ranking.back")}
                </button>
            </div>
        </div>
    );
}