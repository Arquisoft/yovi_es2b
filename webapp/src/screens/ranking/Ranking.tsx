import { useEffect, useState } from "react";
import Home from "../game/Home";
import "./Ranking.css";
import RankingFiltered from "./RankingFiltered";
import InitialScreen from "../init/InitialScreen";
import AppHeader from "../../components/header/AppHeader";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";

type RankingApiEntry = {
    username: string;
    value: number;
    percentage?: string | number;
};

export default function Ranking({ username }: Readonly<{ username: string }>) {

    const { t } = useLanguageContext(); // para internacionalizar

    const [goBack, setGoBack] = useState(false); // Estado para volver al menú principal
    const [goFiltered, setGoFiltered] = useState(false); // Estado para mostrar el ranking filtrado por victorias (en lugar del global)
    const [goLogin, setGoLogin] = useState(false); // Estado para volver a la pantalla de inicio de sesión
    const [position, setPosition] = useState<number | null>(null); // Estado para almacenar la posición del usuario en el ranking global
    const [loadingPosition, setLoadingPosition] = useState(true); // Estado para indicar si se está cargando la posición del usuario en el ranking global
    const [positionError, setPositionError] = useState(false); // Estado para indicar si ha habido un error al cargar la posición del usuario en el ranking global

    // Carga la posición del usuario en el ranking global al montar el componente, y cada vez que cambie el nombre de usuario.
    // Hace una petición GET al endpoint /ranking/wins para obtener el ranking global de victorias, y calcula la posición del usuario en el ranking global.
    // Define la funcion obtener posicion dentro del useEffect para evitar problemas de dependencias, ya que no se necesita fuera del useEffect y no depende de ningún estado o prop.
    // El ranking global se ordena por número de victorias, y en caso de empate, por porcentaje de victorias. Si el usuario no está en el ranking global, se muestra "Sin posición". Si hay un error al cargar el ranking global, se muestra "No disponible".
    useEffect(() => {
        const obtenerPosicion = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL_WA ?? "http://localhost:3000";
                const res = await fetch(`${API_URL}/ranking/wins`); // GET sin body

                const data = await res.json(); // El ranking global se espera que esté en data.ranking
                if (!res.ok || !Array.isArray(data.ranking)) {
                    throw new Error(t("error.rankingError"));
                }

                // Calcula la posición del usuario en el ranking global, teniendo en cuenta empates.
                // Si hay empates, se asigna la misma posición a los usuarios empatados, y la siguiente posición se salta en consecuencia.
                const entries = data.ranking as RankingApiEntry[];
                const positions: number[] = [];
                for (let i = 0; i < entries.length; i++) {
                    let pos: number;
                    if (i === 0) { // El primer usuario siempre tiene posición 1
                        pos = 1;
                    } else {
                        const prev = entries[i - 1]; // Compara con el usuario anterior para detectar empates
                        const sameValue = entries[i].value === prev.value; // Si el número de victorias es el mismo, se considera empate
                        const samePct = String(entries[i].percentage ?? "0").replace("%", "") === String(prev.percentage ?? "0").replace("%", ""); 
                        // Si el porcentaje de victorias es el mismo, se considera empate (se compara como string para evitar problemas de formato)
                        pos = (sameValue && samePct) ? positions[i - 1] : i + 1; // Si hay empate, se asigna la misma posición que el usuario anterior, si no, se asigna la posición correspondiente al índice (i + 1 porque el índice empieza en 0)
                    }
                    positions.push(pos);
                }

                const index = entries.findIndex((entry) => entry.username === username); // Busca el índice del usuario en el ranking global
                setPosition(index >= 0 ? positions[index] : null); 
                setPositionError(false);
            } catch {
                setPosition(null);
                setPositionError(true);
            } finally {
                setLoadingPosition(false);
            }
        };

        obtenerPosicion();
    }, [username]);

    if (goLogin) return <InitialScreen />;
    if (goBack) return <Home username={username} />;
    if (goFiltered) return <RankingFiltered username={username} />;

    return (
        <div className="ranking-screen">
            <AppHeader onLogout={() => setGoLogin(true)} />
            <img className="ranking-logo" src="/yovi_logo.png" alt={t("common.logoAlt")} />
            <h1 className="ranking-screen-title">{t("ranking.title")}</h1>

            <div className="ranking-position-card">
                <p className="ranking-position-label">{t("ranking.position")}</p>
                {loadingPosition && <p className="ranking-position-value">...</p>}
                {!loadingPosition && !positionError && position !== null && (
                    <p className="ranking-position-value">#{position}</p>
                )}
                {!loadingPosition && !positionError && position === null && (
                    <p className="ranking-position-value">{t("ranking.noposition")}</p>
                )}
                {!loadingPosition && positionError && (
                    <p className="ranking-position-value">{t("ranking.notavailable")}</p>
                )}
            </div>

            <div className="ranking-menu">
                <button className="ranking-btn-filtered" onClick={() => setGoFiltered(true)}>
                    {t("ranking.seerank")}
                </button>

                <button className="ranking-btn-menu" onClick={() => setGoBack(true)}>
                    {t("ranking.back")}
                </button>
            </div>
        </div>
    );
}