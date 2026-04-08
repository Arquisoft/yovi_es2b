import { useState, useEffect } from "react";
import type { GetMedal, ObtenerDatosRanking } from "./RankingFiltered";
import "./RankingFilterTypes.css";

type DifficultyFilter = "EASY" | "MEDIUM" | "HARD";

//
type RankingEntry = {
    position: number;
    username: string;
    value: number;
    percentage: string;
};

const DIFFICULTY_LABELS: Record<DifficultyFilter, string> = {
    EASY:   "Fácil",
    MEDIUM: "Media",
    HARD:   "Difícil",
};

const DIFFICULTY_COLORS: Record<DifficultyFilter, string> = {
    EASY: "ranking-info--green",
    MEDIUM: "ranking-info--orange",
    HARD: "ranking-info--red",
};

export default function RankingDifficulty({ username, obtenerDatos, getMedal }: { username: string; obtenerDatos: ObtenerDatosRanking; getMedal: GetMedal }) {

    const [difficulty, setDifficulty] = useState<DifficultyFilter>("EASY");
    const [data, setData] = useState<RankingEntry[]>([]);

    useEffect(() => {
        const cargarDatos = async () => {
            const resultado = await obtenerDatos("/ranking/wins/difficulty", { difficulty });
            const rankingNormalizado = resultado.map((entry) => ({
                position: entry.position,
                username: entry.username,
                value: entry.value,
                percentage: String(entry.percentage ?? 0),
            }));
            setData(rankingNormalizado);
        };
        cargarDatos();
    }, [difficulty]);

    return (
        <div className="ranking-diff-screen">

            <h3 className="ranking-table-title">Victorias por dificultad</h3>

            <div className="ranking-filter-row">
                {(Object.keys(DIFFICULTY_LABELS) as DifficultyFilter[]).map((d) => (
                    <button
                        key={d}
                        className={difficulty === d ? `ranking-info ${DIFFICULTY_COLORS[d]} ${DIFFICULTY_COLORS[d]}--active` : `ranking-info ${DIFFICULTY_COLORS[d]}`}
                        onClick={() => setDifficulty(d)}
                    >
                        {DIFFICULTY_LABELS[d]}
                    </button>
                ))}
            </div>

            <table className="ranking-table">
                <thead>
                    <tr>
                        <td>Posición</td>
                        <td>Jugador</td>
                        <td>Victorias ({DIFFICULTY_LABELS[difficulty]})</td>
                        <td>%</td>
                    </tr>
                </thead>
                <tbody>
                    {data.map((entry) => (
                        <tr
                            key={entry.username}
                            className={entry.username === username ? "ranking-row--me" : ""}
                        >
                            <td>{getMedal(entry.position)}</td>
                            <td>
                                {entry.username}
                                {entry.username === username && (
                                    <span className="ranking-user-tag">Tú</span>
                                )}
                            </td>
                            <td>{entry.value} </td>
                            <td>{entry.percentage}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}
