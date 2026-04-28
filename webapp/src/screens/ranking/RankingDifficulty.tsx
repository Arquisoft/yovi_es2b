import { useState, useEffect } from "react";
import type { GetMedal, ObtenerDatosRanking, SortRule, RankingEntryShared } from "./RankingFiltered";
import { sortData } from "./RankingFiltered";
import "./RankingFilterTypes.css";

type DifficultyFilter = "EASY" | "MEDIUM" | "HARD";

type RankingEntry = RankingEntryShared; // El ranking de dificultad tiene la misma estructura que el ranking global, pero con un valor específico para cada dificultad, por lo que se puede reutilizar el mismo tipo.

// Etiquetas para cada dificultad, usados en los botones de filtro y en la tabla de ranking.
const DIFFICULTY_LABELS: Record<DifficultyFilter, string> = {
    EASY:   "Fácil",
    MEDIUM: "Media",
    HARD:   "Difícil",
};

// Colores para cada dificultad, usados en los botones de filtro y en la tabla de ranking. Se definen como clases CSS para facilitar su aplicación condicionalmente.
const DIFFICULTY_COLORS: Record<DifficultyFilter, string> = {
    EASY: "ranking-info--green",
    MEDIUM: "ranking-info--orange",
    HARD: "ranking-info--red",
};

export default function RankingDifficulty({ username, obtenerDatos, getMedal, sortBy }: Readonly<{ username: string; obtenerDatos: ObtenerDatosRanking; getMedal: GetMedal; sortBy: SortRule }>) {

    const [difficulty, setDifficulty] = useState<DifficultyFilter>("EASY"); // Estado para almacenar la dificultad seleccionada, por defecto "EASY"
    const [data, setData] = useState<RankingEntry[]>([]); // Estado para almacenar los datos del ranking filtrado por dificultad

    // Carga los datos del ranking filtrado por dificultad al montar el componente, y cada vez que cambie la dificultad seleccionada.
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
                    {/* Mapea los datos del ranking filtrado por dificultad a filas de la tabla, ordenados según la regla de ordenación definida en sortBy. 
                    Si el usuario actual está en el ranking, se resalta su fila con una clase CSS específica. */}
                    {sortData(data, sortBy).map((entry) => (
                        <tr
                            key={entry.username}
                            className={entry.username === username ? "ranking-row--me" : ""}
                        >
                            <td>{getMedal(entry.position)}</td>
                            <td>
                                {entry.username}
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
