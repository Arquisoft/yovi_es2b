import { useState } from "react";
import Home from "../game/Home";
import "./Ranking.css";


const yoviLogo = "/yovi_logo.png";

export default function Ranking({ username }: { username: string }) {
    const [goBack, setGoBack] = useState(false);

    if (goBack) return <Home username={username} />;

    return (
        <div className="ranking-screen">
            <img src={yoviLogo} alt="YOVI Logo" className="home-screen__logo" />
            <h1 className="ranking-screen-title">Ranking global</h1>

            <div className="ranking-menu">
                <button className="ranking-btn-filtered">
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