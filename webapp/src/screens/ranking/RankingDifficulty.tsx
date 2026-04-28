import { useState, useEffect } from "react";
import type { GetMedal, ObtenerDatosRanking, SortRule, RankingEntryShared } from "./RankingFiltered";
import { sortData } from "./RankingFiltered";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";
import "./RankingFilterTypes.css";

type DifficultyFilter = "EASY" | "MEDIUM" | "HARD";

type RankingEntry = RankingEntryShared;

const DIFFICULTY_COLORS: Record<DifficultyFilter, string> = {
    EASY: "ranking-info--green",
    MEDIUM: "ranking-info--orange",
    HARD: "ranking-info--red",
};

export default function RankingDifficulty({ username, obtenerDatos, getMedal, sortBy }: Readonly<{ username: string; obtenerDatos: ObtenerDatosRanking; getMedal: GetMedal; sortBy: SortRule }>) {
    const { t } = useLanguageContext();
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

            <h3 className="ranking-table-title">{t('ranking.diffTitle')}</h3>

            <div className="ranking-filter-row">
                <button
                    key="EASY"
                    className={difficulty === "EASY" ? `ranking-info ${DIFFICULTY_COLORS["EASY"]} ${DIFFICULTY_COLORS["EASY"]}--active` : `ranking-info ${DIFFICULTY_COLORS["EASY"]}`}
                    onClick={() => setDifficulty("EASY")}
                >
                    {t('ranking.easy')}
                </button>
                <button
                    key="MEDIUM"
                    className={difficulty === "MEDIUM" ? `ranking-info ${DIFFICULTY_COLORS["MEDIUM"]} ${DIFFICULTY_COLORS["MEDIUM"]}--active` : `ranking-info ${DIFFICULTY_COLORS["MEDIUM"]}`}
                    onClick={() => setDifficulty("MEDIUM")}
                >
                    {t('ranking.medium')}
                </button>
                <button
                    key="HARD"
                    className={difficulty === "HARD" ? `ranking-info ${DIFFICULTY_COLORS["HARD"]} ${DIFFICULTY_COLORS["HARD"]}--active` : `ranking-info ${DIFFICULTY_COLORS["HARD"]}`}
                    onClick={() => setDifficulty("HARD")}
                >
                    {t('ranking.hard')}
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
                            <td>{entry.value} </td>
                            <td>{entry.percentage}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}
