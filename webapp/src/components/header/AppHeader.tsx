import { useState } from "react";
import "./AppHeader.css";
import { useTheme } from "../../screens/modo_tema/Theme";

const yoviLogo = "/yovi_icon.svg";

interface AppHeaderProps {
    onLogout: () => void;
}

export default function AppHeader({ onLogout }: Readonly<AppHeaderProps>) {
    const { theme, toggleTheme } = useTheme(); // Hook personalizado para cambiar el tema
    const [open, setOpen] = useState(false); // Estado para controlar el menú desplegable

    return (
        <header className="app-header">
            <div className="app-header_logo-area">
                <img src={yoviLogo} alt="yovi logo" className="app-header_icon" />
                <span className="app-header_brand">YOVI</span>
            </div>

            <div className="app-header_menu-wrapper">
                {open && (
                    //Cada para cerrar el menú al hacer clic fuera de él
                    <div className="app-header_overlay" onClick={() => setOpen(false)} />
                )}

                <button
                    className="app-header_menu-btn"
                    //onClick para alternar el estado del menú desplegable, permitiendo abrirlo y cerrarlo al hacer clic en el botón
                    onClick={() => setOpen(prev => !prev)}
                    aria-haspopup="true" // Indica que el botón controla un menú desplegable
                    aria-expanded={open} // Indica si el menú está actualmente abierto o cerrado para mejorar la accesibilidad
                    aria-label="Menú de opciones" //Para describir la función del botón a los usuarios de lectores de pantalla
                >
                    👤 MENU <span className={`app-header_chevron ${open ? "open" : ""}`}>▾</span>
                </button>

                {open && (
                    <div className="app-header_dropdown" role="menu">

                        <button
                            className="app-header_dropdown-item"
                            role="menuitem"
                            onClick={() => { toggleTheme(); setOpen(false); }}
                        >
                            {theme === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro"}
                        </button>

                        <button
                            className="app-header_dropdown-item app-header_dropdown-item--disabled"
                            role="menuitem" 
                            disabled
                            title="Idioma"
                        >
                            🌐 Idioma <span className="app-header_badge">Próximamente</span>
                        </button>

                        <hr className="app-header_divider" />

                        <button
                            className="app-header_dropdown-item app-header_dropdown-item--danger"
                            role="menuitem" // onClick para cerrar sesión, llamando a la función onLogout pasada como prop y cerrando el menú después de hacer clic
                            onClick={() => { onLogout(); setOpen(false); }}
                        >
                            Cerrar sesión
                        </button>

                    </div>
                )}
            </div>

        </header>
    );
}
