import { useState, useEffect } from "react";
import type { GetMedal, ObtenerDatosRanking } from "./RankingFiltered";
import "./RankingFilterTypes.css";

type FilterKey = "victorias" | "derrotas" | "abandonadas";

// TIPO DE ENTRADA DEL RANKING. 
type RankingEntry = {
    position: number; // posición en el ranking 
    username: string; // nombre del jugador
    value: number; // número de victorias, derrotas o abandonos según el filtro
    percentage: number; // porcentaje de victorias, derrotas o abandonos sobre el total de partidas
};

const FILTER_LABELS: Record<FilterKey, string> = {
    victorias:   "Victorias",
    derrotas:    "Derrotas",
    abandonadas: "Partidas abandonadas",
};

const ENDPOINTS: Record<FilterKey, string> = {
    victorias:   "/ranking/wins",
    derrotas:    "/ranking/defeats",
    abandonadas: "/ranking/abandonments",
};

const FILTER_COLORS: Record<FilterKey, string> = {
    victorias: "ranking-info--green",
    derrotas: "ranking-info--red",
    abandonadas: "ranking-info--orange",
};

export default function RankingGeneral({ username, obtenerDatos, getMedal }: { username: string; obtenerDatos: ObtenerDatosRanking; getMedal: GetMedal }) {

    const [filter, setFilter] = useState<FilterKey>("victorias"); // Estado para el filtro seleccionado. Por defecto, se muestra el ranking por victorias.
    const [data, setData] = useState<RankingEntry[]>([]); // Estado para los datos del ranking. Se actualiza cada vez que cambia el filtro.

    //Funcion definida dentro de RankingGeneral para cargar los datos del ranking según el filtro seleccionado
    // Llama a la función obtenerDatos y actualiza el estado "data" con los resultados.
    const cargarDatos = async () => {
        const resultado = await obtenerDatos(ENDPOINTS[filter], {});
        // Normaliza los datos recibidos para asegurarse de que tienen la estructura esperada (position, username, value y percentage). Esto es útil en caso de que el backend no devuelva exactamente estos campos o si se necesitan transformar de alguna manera.
        const rankingNormalizado = resultado.map((entry) => ({
            position: entry.position,
            username: entry.username,
            value: entry.value,
            percentage: entry.percentage ?? 0,
        }));
        setData(rankingNormalizado);
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
                        className={filter === f ? `ranking-info ${FILTER_COLORS[f]} ${FILTER_COLORS[f]}--active` : `ranking-info ${FILTER_COLORS[f]}`}
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
                            <td>{entry.value}</td>
                            <td>{entry.percentage}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}
