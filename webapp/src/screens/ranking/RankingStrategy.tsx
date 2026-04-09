import { useState, useEffect } from "react";
import type { GetMedal, ObtenerDatosRanking, SortRule } from "./RankingFiltered";
import "./RankingFilterTypes.css";

type StrategyFilter =
    | "RANDOM"
    | "DEFENSIVO"
    | "OFENSIVO"
    | "MONTE_CARLO"
    | "MONTE_CARLO_MEJORADO"
    | "MONTE_CARLO_ENDURECIDO";

type RankingEntry = {
    position: number;
    username: string;
    value: number;
    percentage: string;
};

const STRATEGY_LABELS: Record<StrategyFilter, string> = {
    RANDOM:                 "Random",
    DEFENSIVO:              "Defensiva",
    OFENSIVO:               "Ofensiva",
    MONTE_CARLO:            "Monte Carlo",
    MONTE_CARLO_MEJORADO:   "Monte Carlo Mejorado",
    MONTE_CARLO_ENDURECIDO: "Monte Carlo Endurecido",
};

function sortData(data: RankingEntry[], sortBy: SortRule): RankingEntry[] {
    return data.slice().sort((a, b) =>
        sortBy === "percentage"
            ? Number.parseFloat(b.percentage) - Number.parseFloat(a.percentage)
            : b.value - a.value
    );
}

export default function RankingStrategy({ username, obtenerDatos, getMedal, sortBy }: Readonly<{ username: string; obtenerDatos: ObtenerDatosRanking; getMedal: GetMedal; sortBy: SortRule }>) {

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

            <h3 className="ranking-table-title">Victorias por estrategia</h3>

            <div className="ranking-filter-row">
                {(Object.keys(STRATEGY_LABELS) as StrategyFilter[]).map((s) => (
                    <button
                        key={s}
                        className={strategy === s ? "ranking-info ranking-info--active" : "ranking-info"}
                        onClick={() => setStrategy(s)}
                    >
                        {STRATEGY_LABELS[s]}
                    </button>
                ))}
            </div>


            <table className="ranking-table">
                <thead>
                    <tr>
                        <td>Posición</td>
                        <td>Jugador</td>
                        <td>Victorias ({STRATEGY_LABELS[strategy]})</td>
                        <td>%</td>
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
