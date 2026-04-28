import { useState, useEffect } from "react";
import type { GetMedal, ObtenerDatosRanking, SortRule, RankingEntryShared } from "./RankingFiltered";
import { sortData } from "./RankingFiltered";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";
import "./RankingFilterTypes.css";

type StrategyFilter =
    | "RANDOM"
    | "DEFENSIVO"
    | "OFENSIVO"
    | "MONTE_CARLO"
    | "MONTE_CARLO_MEJORADO"
    | "MONTE_CARLO_ENDURECIDO";

type RankingEntry = RankingEntryShared;

export default function RankingStrategy({ username, obtenerDatos, getMedal, sortBy }: Readonly<{ username: string; obtenerDatos: ObtenerDatosRanking; getMedal: GetMedal; sortBy: SortRule }>) {
    const { t } = useLanguageContext();
    const [strategy, setStrategy] = useState<StrategyFilter>("RANDOM");
    const [data, setData] = useState<RankingEntry[]>([]);

    useEffect(() => {
        const cargarDatos = async () => {
            const resultado = await obtenerDatos("/ranking/wins/strategy", { strategy });
            const rankingNormalizado = resultado.map((entry) => ({
                position: entry.position,
                username: entry.username,
                value: entry.value,
                percentage: entry.percentage ?? "0",
            }));
            setData(rankingNormalizado);
        };
        cargarDatos();
    }, [strategy]);

    return (
        <div className="ranking-strat-screen">

            <h3 className="ranking-table-title">{t('ranking.stratTitle')}</h3>

            <div className="ranking-filter-row">
                <button
                    key="RANDOM"
                    className={strategy === "RANDOM" ? "ranking-info ranking-info--active" : "ranking-info"}
                    onClick={() => setStrategy("RANDOM")}
                >
                    {t('ranking.random')}
                </button>
                <button
                    key="DEFENSIVO"
                    className={strategy === "DEFENSIVO" ? "ranking-info ranking-info--active" : "ranking-info"}
                    onClick={() => setStrategy("DEFENSIVO")}
                >
                    {t('ranking.defensive')}
                </button>
                <button
                    key="OFENSIVO"
                    className={strategy === "OFENSIVO" ? "ranking-info ranking-info--active" : "ranking-info"}
                    onClick={() => setStrategy("OFENSIVO")}
                >
                    {t('ranking.offensive')}
                </button>
                <button
                    key="MONTE_CARLO"
                    className={strategy === "MONTE_CARLO" ? "ranking-info ranking-info--active" : "ranking-info"}
                    onClick={() => setStrategy("MONTE_CARLO")}
                >
                    {t('ranking.monteCarlo')}
                </button>
                <button
                    key="MONTE_CARLO_MEJORADO"
                    className={strategy === "MONTE_CARLO_MEJORADO" ? "ranking-info ranking-info--active" : "ranking-info"}
                    onClick={() => setStrategy("MONTE_CARLO_MEJORADO")}
                >
                    {t('ranking.monteCarloBetter')}
                </button>
                <button
                    key="MONTE_CARLO_ENDURECIDO"
                    className={strategy === "MONTE_CARLO_ENDURECIDO" ? "ranking-info ranking-info--active" : "ranking-info"}
                    onClick={() => setStrategy("MONTE_CARLO_ENDURECIDO")}
                >
                    {t('ranking.monteCarloHard')}
                </button>
            </div>


            <table className="ranking-table">
                <thead>
                    <tr>
                        <td>{t('ranking.positionCol')}</td>
                        <td>{t('ranking.playerCol')}</td>
                        <td>{t('ranking.winsCol')}</td>
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
