import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeType {
    theme: Theme; // El tema actual, que puede ser "light" o "dark"
    toggleTheme: () => void; // Función para alternar entre temas claro y oscuro
}

const ThemeContext = createContext<ThemeType>({
    theme: "light",
    toggleTheme: () => {},
});

//Children para que pueda envolver a otros componentes y proporcionarles acceso al contexto del tema
// Así cualquier componente dentro de este proveedor pueda acceder al tema actual y a la función para cambiarlo.
export function Theme({ children }: { children: React.ReactNode }) {


    // Estado para almacenar el tema actual, inicializado con una función que intenta recuperar la preferencia del usuario desde localStorage o detectar la preferencia del sistema
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("yovi-theme");
        if (saved === "dark" || saved === "light") return saved;
        // Detectar preferencia del sistema
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });

    useEffect(() => {
        // Actualizar el atributo data-theme en el elemento raíz del documento para aplicar el tema seleccionado
        document.documentElement.setAttribute("data-theme", theme); 
        // Guardar la preferencia del tema en localStorage para que persista entre sesiones
        localStorage.setItem("yovi-theme", theme);
    }, [theme]);

    // Función para alternar entre temas claro y oscuro, actualizando el estado del tema
    // El nuevo tema se determina comparando el tema actual: si es "light", se cambia a "dark", y viceversa
    const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

    return (
        // Proveedor de contexto que envuelve a los componentes hijos, proporcionando el tema actual y la función para cambiarlo a través del contexto
        //Provider hace que los componentes hijos puedan acceder al valor del contexto (theme y toggleTheme) utilizando el hook useContext
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Funcion personalizada (hook) para acceder al contexto del tema
 * Permite a los componentes obtener el tema actual y la función para cambiarlo de manera sencilla
 * @returns 
 */
export function useTheme() {
    return useContext(ThemeContext);
}