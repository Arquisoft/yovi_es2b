import { useState, useEffect } from "react";
import "./GameStats.css";
import "./GameStatsTable.css"
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";

// TIPO ESTADISTICA ESTRATEGIA
type StatStr = {
    estrategia: string;
    ganadas: number;
    perdidas: number;
    jugadas: number;
    porcentaje: string;
};

async function obtenerDatos(username: string, t: (key: string) => string) {
    try {
        const API_URL = import.meta.env.VITE_API_URL_WA ?? 'http://localhost:3000'
        const res = await fetch(`${API_URL}/stratstats`, {
            method: 'POST', headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username : username })
        });

        const stats = await res.json();

        if(res.ok) {
            return stats.stats;
        } else {
            throw new Error(stats.error || t("error.serverError"));
        }
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : t("error.networkError"), { cause: err });
    }    
}

export default function GameStatsStra( {username} : { username: string }) {

    const [data, setData] = useState<StatStr[]>([]);
    const { t } = useLanguageContext();
    useEffect(() => {
            const cargarDatos = async () => {
                const resultado = await obtenerDatos(username, t);
                setData(resultado);
            };
        cargarDatos();
    }, [username]);


    return (
        <div className="stats-strat-screen">

            <table className="stats-strat-table">
                <thead>
                    <tr>
                        <td>{t("stats.strat")}</td>
                        <td>{t("stats.wins")}</td>
                        <td>{t("stats.losses")}</td>
                        <td>{t("stats.played")}</td>
                        <td>{t("stats.percentage")}</td>
                    </tr>
                </thead>
                <tbody>
                    {data.map((stat, index) => (
                        <tr key={index}>
                            <td>{stat.estrategia}</td>
                            <td>{stat.ganadas}</td>
                            <td>{stat.perdidas}</td>
                            <td>{stat.jugadas}</td>
                            <td>{stat.porcentaje}</td>
                        </tr>
                    ))}
                 </tbody>
            </table>
            
        </div>
        
    );
}
