import { useState } from "react";
import Home from "../game/Home.tsx";
import GameStats from "./GameStats.tsx";
import GameStatsDifficulty from "./GameStatsDifficuty.tsx";
import GameStatsStrategy from "./GameStatsStrategy.tsx";
import InitialScreen from "../init/InitialScreen.tsx";
import "./GameStats.css";
import AppHeader from "../../components/header/AppHeader.tsx";
import { useLanguageContext } from "../../i18n/LanguageProvider.tsx";

export default function GameStatsFiltered( {username} : { username: string }) {

    const [goBack, setGoBack] = useState(false);
    const [goHome, setGoHome] = useState(false);
    const [goLogin, setGoLogin] = useState(false);

    const { t } = useLanguageContext();

    if (goLogin) return <InitialScreen />;
    if (goBack) return <GameStats username={username}/>;
    if (goHome) return <Home username={username}/>;

    return (
        <div className="stats-screen-filter">
            <AppHeader onLogout={() => setGoLogin(true)} />
            <div className="header">
                <h1 className="stats-screen-filter-title">{t("stats.filtereddescription")}</h1>
                <h2 className="stats-filter-screen-username">{username}</h2>
            </div>

            <div className="stats-menu-filter">

                <div className="stats-menu-filter-difficulty">
                    <GameStatsDifficulty username={username}/>
                </div>

                <br></br>

                <div className="stats-menu-filter-strategy">
                    <GameStatsStrategy username={username}/>
                </div>

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
