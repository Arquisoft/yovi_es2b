import { useState, useEffect } from "react";
import "./GameStats.css";
import "./GameStatsTable.css"

// TIPO ESTADISTICA DIFICULTAD
type StatDif = {
    dificultad: string;
    ganadas: number;
    perdidas: number;
    jugadas: number;
    porcentaje: string;
};

/**
 * Funcion para obtener las estadísticas de dificultad del usuario desde el backend.
 * Hace una petición POST al endpoint /diffstats con el nombre de usuario en el cuerpo de la solicitud, 
 * devuelve un array de objetos con las estadísticas de dificultad del usuario.
 * @param username 
 * @returns 
 */
async function obtenerDatos(username: string) {
    try {
        const API_URL = import.meta.env.VITE_API_URL_WA ?? 'http://localhost:3000'
        const res = await fetch(`${API_URL}/diffstats`, {
            method: 'POST', headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username : username }) 
        });

        const stats = await res.json(); 

        // Si la respuesta es correcta, devuelve las estadísticas. Si no, lanza un error con el mensaje de error del servidor o un mensaje genérico.
        if(res.ok) {
            return stats.stats;
        } else {
            throw new Error(stats.error || 'Server error');
        }
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Network error', { cause: err });
    }    
}

/**
 * Funcion para mostrar las estadísticas de dificultad del usuario.
 * Muestra una tabla con las estadísticas de dificultad del usuario, incluyendo el número de victorias, derrotas, partidas jugadas y porcentaje de victorias para cada dificultad.
 * @param param0 
 * @returns 
 */
export default function GameStatsDiff( {username} : { username: string }) {

    const [data, setData] = useState<StatDif[]>([]); // Estado para almacenar las estadísticas de dificultad del usuario

    // Carga las estadísticas de dificultad del usuario al montar el componente, y cada vez que cambie el nombre de usuario.
    useEffect(() => {
        const cargarDatos = async () => {
            const resultado = await obtenerDatos(username);
            setData(resultado);
        };
        cargarDatos();
    }, [username]);

    return (
        <div className="stats-diff-screen">

            <table className="stats-diff-table">
                <thead>
                    <tr>
                        <td>Dificultad</td>
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
