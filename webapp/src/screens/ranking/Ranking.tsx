import { useState } from "react";
import Home from "../game/Home";
import "./Ranking.css";
import RankingFiltered from "./RankingFiltered";

export default function Ranking({ username }: { username: string }) {
    const [goBack, setGoBack] = useState(false);
    const [goFiltered, setGoFiltered] = useState(false);


    if (goBack) return <Home username={username} />;
    if (goFiltered) return <RankingFiltered username={username} />;

    return (
        <div className="ranking-screen">
            <img src={"/yovi_logo.png"} alt="YOVI Logo" />
            <h1 className="ranking-screen-title">Ranking global</h1>

            <div className="ranking-menu">
                <button className="ranking-btn-filtered" onClick={() => setGoFiltered(true)}>
                    Ver ranking
                </button>

                <br />

                <button className="ranking-btn-back" onClick={() => setGoBack(true)}>
                    Volver al menú principal
                </button>
            </div>
        </div>
    );
}