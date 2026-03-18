import { useState, useEffect } from "react";
import Home from "../game/Home.tsx";
import GameStats from "./GameStats.tsx";
import "./GameStats.css";

// TIPO ESTADISTICA
/*type Stat = {
    dificultad: string;
    estrategia: string;
    ganadas: number;
    jugadas: number;
};*/

// TIPO ESTADISTICA PARA USO EN LA TABLA
type StatAdapted = {
    dificultad: string;
    estrategia: string;
    ganadas: number;
    perdidas: number;
    jugadas: number;
    porcentaje: string;
};

async function obtenerDatos() {
//async function obtenerDatos(username: string) {
    return [
        { dificultad: "Fácil", estrategia: "Agresiva", ganadas: 8, jugadas: 10, perdidas: 2, porcentaje: "80.00 %" },
        { dificultad: "Media", estrategia: "Defensiva", ganadas: 5, jugadas: 12, perdidas: 7, porcentaje: "41.67 %" },
        { dificultad: "Difícil", estrategia: "Mixta", ganadas: 2, jugadas: 8, perdidas: 6, porcentaje: "25.00 %" },
    ];
}

export default function GameStatsTotal( {username} : { username: string }) {

    const [goBack, setGoBack] = useState(false);
    const [goHome, setGoHome] = useState(false);

    const [data, setData] = useState<StatAdapted[]>([]);

    useEffect(() => {
        const cargarDatos = async () => {
            const resultado = await obtenerDatos();
            setData(resultado);
        };
        cargarDatos();
    }, [username]);

    if (goBack) {
        return <GameStats username={username}/>;
    }
    if (goHome) {
        return <Home username={username}/>;
    }


    return (
        <div className="stats-total-screen">
            <h2 className="stats-total-screen-title">Todas las estadísticas de:</h2>
            <h1 className="stats-total-screen-username">{username}</h1>

            <div className="stats-total-menu">

                <table className="stats-total-table">
                    <thead>
                        <tr>
                            <td>Dificultad</td>
                            <td>Estrategia</td>
                            <td>Victorias</td>
                            <td>Derrotas</td>
                            <td>Partidas jugadas</td>
                            <td>Porcentaje de victorias</td>
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
                
                <button className="stats-total-btn-back" onClick={() => setGoBack(true)}>
                    Volver al menú de estadísticas
                </button>

                <br></br> 

                <button className="stats-total-btn-home" onClick={() => setGoHome(true)}>
                    Volver al menú principal
                </button>
                
            </div>
            
        </div>
    );
}
