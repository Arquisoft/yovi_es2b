import { useState, useEffect } from "react";
import "./RankingFilterTypes.css";

type FilterKey = "victorias" | "derrotas" | "abandonadas";

// TIPO DE ENTRADA DEL RANKING. 
type RankingEntry = {
    position: number; // posición en el ranking 
    username: string; // nombre del jugador
    value: number; // número de victorias, derrotas o abandonos según el filtro
};

const FILTER_LABELS: Record<FilterKey, string> = {
    victorias:   "Victorias",
    derrotas:    "Derrotas",
    abandonadas: "Partidas abandonadas",
};

const ENDPOINTS: Record<FilterKey, string> = {
    victorias:   "/ranking/wins",
    derrotas:    "/ranking/losses",
    abandonadas: "/ranking/abandoned",
};

async function obtenerDatos(filter: FilterKey) {
    try {
        const apiUrl = import.meta.env.VITE_API_URL_WA || "";
        const res = await fetch(`${apiUrl}${ENDPOINTS[filter]}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error("Server error");
        }

        const ranking: RankingEntry[] = [];
        let posicion = 1;

        for (const entry of data.ranking as Array<{ username: string; value: number }>) {
            ranking.push({
                position: posicion,
                username: entry.username,
                value: entry.value,
            });
            posicion += 1;
        }

        return ranking;
    } catch (err: any) {
        throw new Error("Network error");
    }
}

/**
 * Funcion para mostrar medalla según la posición.
 * @param pos 
 * @returns 
 */
function getMedal(pos: number): string {
    if (pos === 1) return "🥇";
    if (pos === 2) return "🥈";
    if (pos === 3) return "🥉";
    return `#${pos}`;
}

export default function RankingGeneral({ username }: { username: string }) {

    const [filter, setFilter] = useState<FilterKey>("victorias"); // Estado para el filtro seleccionado. Por defecto, se muestra el ranking por victorias.
    const [data, setData] = useState<RankingEntry[]>([]); // Estado para los datos del ranking. Se actualiza cada vez que cambia el filtro.

    //Funcion definida dentro de RankingGeneral para cargar los datos del ranking según el filtro seleccionado
    // Llama a la función obtenerDatos y actualiza el estado "data" con los resultados.
    const cargarDatos = async () =>
        {
            const resultado = await obtenerDatos(filter);
            setData(resultado);
        };

    // useEffect para cargar los datos del ranking cada vez que cambia el filtro. Llama a la función obtenerDatos con el filtro seleccionado y actualiza el estado "data" con los resultados.
    useEffect(() => {
        cargarDatos();
    }, [filter]);

    return (
        <div className="ranking-general-screen">

            <h3 className="ranking-table-title">Clasificación general</h3>

            <div className="ranking-filter-row">
                {/* La funcion map permite iterar sobre las claves del objeto FILTER_LABELS y transformarlas en botones de filtro.
                Map es una función de los arrays en JavaScript que permite transformar cada elemento del array en otro valor. */}
                {(Object.keys(FILTER_LABELS) as FilterKey[]).map((f) => (
                    <button
                    // La clase del botón cambia según si el filtro está activo o no, para mostrar visualmente cuál es el filtro seleccionado.
                        key={f}
                        className={filter === f ? "ranking-chip ranking-chip--active" : "ranking-chip"}
                        onClick={() => setFilter(f)}
                    >
                        {/*El texto del botón se obtiene del objeto FILTER_LABELS, que asigna una etiqueta legible a cada clave de filtro.*/}
                        {FILTER_LABELS[f]}
                    </button>
                ))}
            </div>

            <table className="ranking-table">
                <thead>
                    <tr>
                        <td>Posición</td>
                        <td>Jugador</td>
                        <td>{FILTER_LABELS[filter]}</td>
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
                            <td>{entry.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}
