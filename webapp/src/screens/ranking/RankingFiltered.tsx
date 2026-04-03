import { useState } from "react";
import Home from "../game/Home.tsx";
import Ranking from "./Ranking.tsx";
import "./RankingFiltered.css";

type FilerRule = "general" | "dificultad" | "estrategia";

//Username se muestra en el header y se pasa a los componentes de ranking para mostrar el ranking filtrado por ese usuario. ç
// Se mantiene en este componente para que no se pierda al navegar entre las diferentes vistas del ranking filtrado.
export default function RankingFiltered({ username }: { username: string }) {

    const [goBack, setGoBack] = useState(false); // Para volver a la vista general del ranking
    const [goHome, setGoHome] = useState(false); // Para volver al menú principal (Home)
    const [active, setActive] = useState<Set<FilerRule>>(new Set(["general"])); // Estado para controlar qué vistas del ranking filtrado están activas. Por defecto, se muestra la vista general.

    if (goBack) {
        return <Ranking username={username} />;
    }
    if (goHome) {
        return <Home username={username} />;
    }

    /**
     * Funcion para el menu de filtrado. Recibe una FilterRule y la agrega o elimina del estado "active" dependiendo de si ya está activa o no.
     * Esto permite mostrar u ocultar las diferentes secciones del ranking filtrado según las opciones seleccionadas en el menú.
     * @param rule, la regla de filtrado que se ha toggled (general, dificultad o estrategia) 
     */
    function filterRanking(rule: FilerRule) {
        setActive((prev) => {
            //Set no permite mutar ni duplicados
            const next = new Set(prev);
            if (next.has(rule)) {
                next.delete(rule);
            } else {
                next.add(rule);
            }
            return next;
        }
        );
    }

    // Función para obtener la clase CSS de un botón del menú de filtrado.
    // Si la regla está activa, se añade una clase adicional para indicar que el botón está activo.
    const getButtonClass = (rule: FilerRule) => 
        active.has(rule) ? "ranking-toggle-btn ranking-toggle-btn--active" : "ranking-toggle-btn";

    return (
        <div className="ranking-filtered-screen">

            <div className="ranking-filtered-header">
                <h1 className="ranking-filtered-title">Ranking global</h1>
                <h2 className="ranking-filtered-username">{username}</h2>
            </div>

            {/* menu */}
            <div className="ranking-toggle-menu">
                <button className={getButtonClass("general")} onClick={() => filterRanking("general")}>
                    {active.has("general") && <span className="ranking-toggle-check">✓ </span>}
                    Por partidas
                </button>
                <button className={getButtonClass("dificultad")} onClick={() => filterRanking("dificultad")}>
                    {active.has("dificultad") && <span className="ranking-toggle-check">✓ </span>}
                    Por dificultad
                </button>
                <button className={getButtonClass("estrategia")} onClick={() => filterRanking("estrategia")}>
                    {active.has("estrategia") && <span className="ranking-toggle-check">✓ </span>}
                    Por estrategia
                </button>
            </div>


            <div className="btn-menu">
                <button className="ranking-btn-back" onClick={() => setGoBack(true)}>
                    Volver al ranking general
                </button>
                <button className="ranking-btn-home" onClick={() => setGoHome(true)}>
                    Volver al menú principal
                </button>
            </div>

        </div>
    );
}
