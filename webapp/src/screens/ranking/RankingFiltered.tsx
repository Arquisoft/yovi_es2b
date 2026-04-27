import { useState } from "react";
import Home from "../game/Home.tsx";
import Ranking from "./Ranking.tsx";
import InitialScreen from "../init/InitialScreen.tsx";
import RankingGeneral from "./RankingGeneral.tsx";
import RankingDifficulty from "./RankingDifficulty.tsx";
import RankingStrategy from "./RankingStrategy.tsx";
import "./RankingFiltered.css";
import AppHeader from "../../components/header/AppHeader.tsx";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";

type FilterRule = "general" | "dificultad" | "estrategia";
export type SortRule = "value" | "percentage";

// Tipo para las entradas del ranking, con posición, nombre de usuario y valor (partidas ganadas, victorias por dificultad o victorias por estrategia).
type RankingEntry = {
    position: number;
    username: string;
    value: number;
    percentage: string;
};

export type ObtenerDatosRanking = (
    endpoint: string,
    body: Record<string, unknown>
) => Promise<RankingEntry[]>;

export type GetMedal = (pos: number) => string;

export type RankingEntryShared = {
    position: number;
    username: string;
    value: number;
    percentage: string;
};

export function sortData(data: RankingEntryShared[], sortBy: SortRule): RankingEntryShared[] {
    const sorted = data.slice().sort((a, b) => {
        if (sortBy === "percentage") {
            const diff = Number.parseFloat(b.percentage) - Number.parseFloat(a.percentage);
            return diff || b.value - a.value;
        }
        const diff = b.value - a.value;
        return diff || Number.parseFloat(b.percentage) - Number.parseFloat(a.percentage);
    });
    const result: RankingEntryShared[] = [];
    for (let i = 0; i < sorted.length; i++) {
        let position: number;
        if (i === 0) {
            position = 1;
        } else {
            const prev = result[i - 1];
            if (sorted[i].value === sorted[i - 1].value && sorted[i].percentage === sorted[i - 1].percentage) {
                position = prev.position;
            } else {
                position = i + 1;
            }
        }
        result.push({ ...sorted[i], position });
    }
    return result;
}

/**
 *  Funcino para obtener la medalla correspondiente a una posición en el ranking. 
 * @param pos 
 * @returns 
 */
export const getMedal: GetMedal = (pos) => {
    if (pos === 1) return "🥇";
    if (pos === 2) return "🥈";
    if (pos === 3) return "🥉";
    return `#${pos}`;
};

// Convierte cualquier valor de porcentaje del backend a string limpio (sin %). Si el valor es null, undefined o no es un número válido, devuelve "0".
function toPercentageString(raw: unknown): string {
    if (raw === null || raw === undefined) return "0";
    if (typeof raw === "number") return Number.isFinite(raw) ? String(raw) : "0";
    if (typeof raw === "string") {
        const clean = raw.replace("%", "").trim();
        return clean.length > 0 ? clean : "0";
    }
    return "0";
}

//Username se muestra en el header y se pasa a los componentes de ranking para mostrar el ranking filtrado por ese usuario. ç
// Se mantiene en este componente para que no se pierda al navegar entre las diferentes vistas del ranking filtrado.
export default function RankingFiltered({ username }: Readonly<{ username: string }>) {

    const [goBack, setGoBack] = useState(false); // Para volver a la vista general del ranking
    const [goHome, setGoHome] = useState(false); // Para volver al menú principal (Home)
    const [goLogin, setGoLogin] = useState(false);
    const [active, setActive] = useState<Set<FilterRule>>(new Set(["general"])); // Estado para controlar qué vistas del ranking filtrado están activas. Por defecto, se muestra la vista general.
    const [sortBy, setSortBy] = useState<SortRule>("value");
    const { t } = useLanguageContext();

    if (goLogin) return <InitialScreen />;
    if (goBack) return <Ranking username={username} />;
    if (goHome) return <Home username={username} />;

    /**
     * Funcion para el menu de filtrado. Recibe una FilterRule y la agrega o elimina del estado "active" dependiendo de si ya está activa o no.
     * Esto permite mostrar u ocultar las diferentes secciones del ranking filtrado según las opciones seleccionadas en el menú.
     * @param rule, la regla de filtrado que se ha toggled (general, dificultad o estrategia) 
     */
    function filterRanking(rule: FilterRule) {
        setActive((prev) => {
            //Set no permite mutar ni duplicados
            const next = new Set(prev);
            if (next.has(rule)) {
                next.delete(rule);
            } else {
                next.add(rule);
            }
            return next;
        }
        );
    }

    // Función para obtener la clase CSS de un botón del menú de filtrado.
    // Si la regla está activa, se añade una clase adicional para indicar que el botón está activo.
    const getButtonClass = (rule: FilterRule) =>
        active.has(rule) ? "ranking-toggle-btn ranking-toggle-btn--active" : "ranking-toggle-btn";

    // Función para obtener la clase CSS de un botón de ordenación.
    // Si la regla de ordenación coincide con la seleccionada, se añade una clase adicional para indicar que el botón está activo.
    const getSortClass = (key: SortRule) =>
        sortBy === key ? "ranking-sort-btn ranking-sort-btn--active" : "ranking-sort-btn";

    // Función para obtener los datos del ranking desde el backend.
    // Recibe un endpoint y un body, hace una petición POST al backend y devuelve los datos formateados como un array de RankingEntry.
    const obtenerDatos: ObtenerDatosRanking = async (endpoint, body) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL_WA ?? 'http://localhost:3000';
            const tieneBody = Object.keys(body).length > 0;
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: tieneBody ? "POST" : "GET",
                headers: { "Content-Type": "application/json" },
                ...(tieneBody && { body: JSON.stringify(body) }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error("Server error");

            const ranking: RankingEntry[] = [];
            let posicion = 1;
            for (const entry of data.ranking as Array<{ username: string; value: number; percentage?: string }>) {
                ranking.push({
                    position: posicion,
                    username: entry.username,
                    value: entry.value,
                    percentage: toPercentageString(entry.percentage),
                });
                posicion += 1;
            }
            return ranking;
        } catch (err) {
            throw new Error("Network error", { cause: err });
        }
    };

    return (
        <div className="ranking-filtered-screen">

            <AppHeader onLogout={() => setGoLogin(true)} />

            <div className="ranking-filtered-header">
                <h1 className="ranking-filtered-title">{t("ranking.title")}</h1>
            </div>

            {/* menu */}
            <div className="ranking-controls-row">
                <div className="ranking-toggle-menu">
                    <button className={getButtonClass("general")} onClick={() => filterRanking("general")}>
                        {active.has("general") && <span className="ranking-toggle-check">✓ </span>}
                        {t("ranking.bymatches")}
                    </button>
                    <button className={getButtonClass("dificultad")} onClick={() => filterRanking("dificultad")}>
                        {active.has("dificultad") && <span className="ranking-toggle-check">✓ </span>}
                        {t("ranking.bydiff")}
                    </button>
                    <button className={getButtonClass("estrategia")} onClick={() => filterRanking("estrategia")}>
                        {active.has("estrategia") && <span className="ranking-toggle-check">✓ </span>}
                        {t("ranking.bystrat")}
                    </button>
                </div>

                <div className="ranking-sort-menu">
                    <span className="ranking-sort-label">{t("ranking.sort")}</span>
                    <button className={getSortClass("value")} onClick={() => setSortBy("value")}>
                        {t("ranking.number")}
                    </button>
                    <button className={getSortClass("percentage")} onClick={() => setSortBy("percentage")}>
                        {t("ranking.percentage")}
                    </button>
                </div>
            </div>
            

            <div className="ranking-filtered-body">
                {active.has("general") && (
                    <div className="ranking-filtered-section">
                        <RankingGeneral username={username} obtenerDatos={obtenerDatos} getMedal={getMedal} sortBy={sortBy} />
                    </div>
                )}
                {active.has("dificultad") && (
                    <div className="ranking-filtered-section">
                        <RankingDifficulty username={username} obtenerDatos={obtenerDatos} getMedal={getMedal} sortBy={sortBy} />
                    </div>
                )}
                {active.has("estrategia") && (
                    <div className="ranking-filtered-section">
                        <RankingStrategy username={username} obtenerDatos={obtenerDatos} getMedal={getMedal} sortBy={sortBy} />
                    </div>
                )}
                {active.size === 0 && (
                    <p className="ranking-empty">{t("ranking.selectCat")}</p>
                )}
            </div>


            <div className="btn-menu">
                <button className="ranking-btn-back-ranking" onClick={() => setGoBack(true)}>
                    {t("ranking.seepersonalrank")}
                </button>
                <button className="ranking-btn-back-menu" onClick={() => setGoHome(true)}>
                    {t("ranking.back")}
                </button>
            </div>

        </div>
    );
}
