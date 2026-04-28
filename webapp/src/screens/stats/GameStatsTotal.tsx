import { useState, useEffect } from "react";
import Home from "../game/Home.tsx";
import GameStats from "./GameStats.tsx";
import InitialScreen from "../init/InitialScreen.tsx";
import "./GameStats.css";
import "./GameStatsTable.css"
import AppHeader from "../../components/header/AppHeader.tsx";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";

// TIPO ESTADISTICA PARA USO EN LA TABLA
type AllStat = {
    dificultad: string;
    estrategia: string;
    ganadas: number;
    perdidas: number;
    jugadas: number;
    porcentaje: string;
};

async function obtenerDatos(username: string, t: (key: string) => string) {
    try {
        const API_URL = import.meta.env.VITE_API_URL_WA ?? 'http://localhost:3000'
        const res = await fetch(`${API_URL}/allstats`, {
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

export default function GameStatsTotal( {username} : { username: string }) {

    const [goBack, setGoBack] = useState(false);
    const [goHome, setGoHome] = useState(false);
    const [goLogin, setGoLogin] = useState(false);

    const [data, setData] = useState<AllStat[]>([]);

    const { t } = useLanguageContext();

    useEffect(() => {
        const cargarDatos = async () => {
            const resultado = await obtenerDatos(username, t);
            setData(resultado);
        };
        cargarDatos();
    }, [username]);

    if (goLogin) return <InitialScreen />;
    if (goBack) return <GameStats username={username}/>;
    if (goHome) return <Home username={username}/>;


    return (
        <div className="stats-total-screen">
            <AppHeader onLogout={() => setGoLogin(true)} />
            <div className="header">
                <h1 className="stats-total-screen-title">{t("stats.totaldescription")}</h1>
                <h2 className="stats-total-screen-username">{username}</h2>
            </div>

            <div className="stats-total-menu">

                <table className="stats-total-table">
                    <thead>
                        <tr>
                            <td>{t("stats.dif")}</td>
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
                                <td>{stat.dificultad}</td>
                                <td>{stat.estrategia}</td>
                                <td>{stat.ganadas}</td>
                                <td>{stat.perdidas}</td>
                                <td>{stat.jugadas}</td>
                                <td>{stat.porcentaje}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                

                <br></br>
                <br></br>    
                
                <div className="btn-menu">
                    <button className="stats-total-btn-back" onClick={() => setGoBack(true)}>
                        {t("stats.gobackstats")}
                    </button>

                    <button className="stats-total-btn-home" onClick={() => setGoHome(true)}>
                        {t("stats.gohome")}
                    </button>
                </div>
                
            </div>
            
        </div>
    );
}
