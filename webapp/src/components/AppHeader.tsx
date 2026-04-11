import "../screens/game/Home.css";

const yoviLogo = "/yovi_logo.png";

interface AppHeaderProps {
    onLogout: () => void;
}

export default function AppHeader({ onLogout }: Readonly<AppHeaderProps>) {
    return (
        <header className="home-header">
            <img src={yoviLogo} alt="YOVI Logo" className="home-header__logo" />
            <button className="home-menu-out__btn home-header__logout" onClick={onLogout}>
                Cerrar sesión
            </button>
        </header>
    );
}
