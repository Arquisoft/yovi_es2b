import { useState, useEffect } from "react";
import type { GetMedal, ObtenerDatosRanking, SortRule, RankingEntryShared } from "./RankingFiltered";
import { sortData } from "./RankingFiltered";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";
import "./RankingFilterTypes.css";

type FilterKey = "victorias" | "derrotas";

type RankingEntry = RankingEntryShared;

// Endpoints para cada filtro, usados para cargar los datos del ranking según el filtro seleccionado.
const ENDPOINTS: Record<FilterKey, string> = {
    victorias:   "/ranking/wins",
    derrotas:    "/ranking/defeats",
};

const FILTER_COLORS: Record<FilterKey, string> = {
    victorias: "ranking-info--green",
    derrotas: "ranking-info--red",
};

// El ranking general tiene la misma estructura que el ranking global, pero con un valor específico para cada filtro, por lo que se puede reutilizar el mismo tipo.
export default function RankingGeneral({ username, obtenerDatos, getMedal, sortBy }: Readonly<{ username: string; obtenerDatos: ObtenerDatosRanking; getMedal: GetMedal; sortBy: SortRule }>) {
    const { t } = useLanguageContext();
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
            percentage: String(entry.percentage ?? 0),
        }));
        setData(rankingNormalizado);
    };

    // useEffect para cargar los datos del ranking cada vez que cambia el filtro. Llama a la función obtenerDatos con el filtro seleccionado y actualiza el estado "data" con los resultados.
    useEffect(() => {
        cargarDatos();
    }, [filter]);

    return (
        <div className="ranking-general-screen">

            <h3 className="ranking-table-title">{t('ranking.generalTitle')}</h3>

            <div className="ranking-filter-row">
                <button
                    key="victorias"
                    className={filter === "victorias" ? `ranking-info ${FILTER_COLORS["victorias"]} ${FILTER_COLORS["victorias"]}--active` : `ranking-info ${FILTER_COLORS["victorias"]}`}
                    onClick={() => setFilter("victorias")}
                >
                    {t('ranking.wins')}
                </button>
                <button
                    key="derrotas"
                    className={filter === "derrotas" ? `ranking-info ${FILTER_COLORS["derrotas"]} ${FILTER_COLORS["derrotas"]}--active` : `ranking-info ${FILTER_COLORS["derrotas"]}`}
                    onClick={() => setFilter("derrotas")}
                >
                    {t('ranking.defeats')}
                </button>
            </div>

            <table className="ranking-table">
                <thead>
                    <tr>
                        <td>{t('ranking.positionCol')}</td>
                        <td>{t('ranking.playerCol')}</td>
                        <td>{filter === "victorias" ? t('ranking.wins') : t('ranking.defeats')}</td>
                        <td>{t('ranking.percentageCol')}</td>
                    </tr>
                </thead>
                <tbody>
                    {sortData(data, sortBy).map((entry) => (
                        <tr
                            key={entry.username}
                            className={entry.username === username ? "ranking-row--me" : ""}
                        >
                            <td>{getMedal(entry.position)}</td>
                            <td>
                                {entry.username}
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
