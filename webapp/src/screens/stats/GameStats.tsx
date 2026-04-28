import { useState } from "react";
import Home from "../game/Home.tsx";
import GameStatsTotal from "./GameStatsTotal.tsx";
import GameStatsFiltered from "./GameStatsFiltered.tsx";
import InitialScreen from "../init/InitialScreen.tsx";
import "./GameStats.css";
import AppHeader from "../../components/header/AppHeader.tsx";
import yoviLogo from "../../../public/yovi_logo.png";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";

export default function GameStats( {username} : { username: string }) {

<<<<<<< HEAD
    const [goBack, setGoBack] = useState(false);
    const [goTotal, setGoTotal] = useState(false);
    const [goFiltered, setGoFiltered] = useState(false);
    const [goLogin, setGoLogin] = useState(false);
    const { t } = useLanguageContext();
=======
    const [goBack, setGoBack] = useState(false); // Estado para volver al menú principal
    const [goTotal, setGoTotal] = useState(false); // Estado para mostrar las estadísticas totales
    const [goFiltered, setGoFiltered] = useState(false); // Estado para mostrar las estadísticas filtradas
    const [goLogin, setGoLogin] = useState(false); // Estado para volver a la pantalla de inicio de sesión
>>>>>>> 1110dc760670d7b81e57199fd2170f42248717cd

    if (goLogin) return <InitialScreen />;
    if (goBack) return <Home username={username}/>;
    if (goTotal) {
        return <GameStatsTotal username={username}/>;
    }
    if (goFiltered) {
        return <GameStatsFiltered username={username}/>;
    }

    return (
        <div className="stats-screen">
            <AppHeader onLogout={() => setGoLogin(true)} />
            
            <img src={yoviLogo} alt={t("common.logoAlt")} className="initial-screen__logo" />
            <h1 className="stats-screen-title">{t("stats.description")}</h1>

            <div className="stats-menu">
                <button className="stats-btn-total" onClick={() => setGoTotal(true)}>
                    {t("stats.total")}
                </button>

                <button className="stats-btn-filt" onClick={() => setGoFiltered(true)}>
                    {t("stats.filter")}
                </button>

                <br></br> 
                
                <button className="stats-btn-back" onClick={() => setGoBack(true)}>
                    {t("stats.back")}
                </button>
                
            </div>
            
        </div>
    );
}
