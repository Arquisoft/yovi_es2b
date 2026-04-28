import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'
import { Theme, useTheme } from '../screens/modo_tema/Theme'

// Componente auxiliar que expone el tema actual y el botón para alternarlo.
// Permite verificar el comportamiento del contexto sin depender de componentes reales.
function ThemeConsumer() {
    const { theme, toggleTheme } = useTheme()
    return (
        <div>
            <span data-testid="theme-value">{theme}</span>
            <button onClick={toggleTheme}>Cambiar tema</button>
        </div>
    )
}

// Crea matchMedia mock, que se encarga de simular la función window.matchMedia en el entorno de pruebas.
// Forzar idioma español para los tests
beforeEach(() => {
    localStorage.setItem('yovi-locale', 'es')
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockReturnValue({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }),
    })
})

// Limpia los mocks, el localStorage y el atributo data-theme después de cada test para evitar interferencias entre pruebas.
// localStorage sirve para almacenar la preferencia del tema, y el atributo data-theme se utiliza para aplicar los estilos del tema en el documento. 
afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
})

/**
 * Tests para el contexto Theme que comprueban que:
 * - El tema inicial se lee correctamente desde localStorage o la preferencia del sistema
 * - toggleTheme alterna correctamente entre light y dark
 * - El atributo data-theme del <html> se actualiza al cambiar el tema
 * - El tema se persiste en localStorage al cambiar
 */
describe('Theme', () => {
    
    /**
     * Comprueba que si no hay preferencia guardada en localStorage y el sistema
     * prefiere el tema claro, el tema inicial es "light".
     */
    test('usa tema light por defecto si el sistema prefiere tema claro', () => {
        render(
            <Theme>
                <ThemeConsumer />
            </Theme>
        )

        expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
    })

    /**
     * Comprueba que si no hay preferencia guardada en localStorage y el sistema
     * prefiere el tema oscuro, el tema inicial es "dark".
     */
    test('usa tema dark por defecto si el sistema prefiere tema oscuro', () => {
        // Simula que el sistema prefiere el tema oscuro estableciendo matches en true en el mock de matchMedia
        window.matchMedia = vi.fn().mockReturnValue({
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        })

        render(<Theme><ThemeConsumer /></Theme>)

        expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')
      })

    /**
     * Comprueba que si hay un tema guardado en localStorage, se usa ese valor
     * como tema inicial en lugar de la preferencia del sistema.
     */
    test('recupera el tema guardado en localStorage al iniciar', () => {
        //LocalStorage guarda la preferencia del tema en el navegador, por lo que al establecerlo en "dark" antes de renderizar
        localStorage.setItem('yovi-theme', 'dark')

        render(
            <Theme>
                <ThemeConsumer />
            </Theme>
        )

        expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')
    })

    /**
     * Comprueba que toggleTheme alterna el tema de light a dark al pulsarlo una vez.
     */
    test('toggleTheme cambia el tema de light a dark', async () => {
        const user = userEvent.setup()
        localStorage.setItem('yovi-theme', 'light')

        render(
            <Theme>
                <ThemeConsumer />
            </Theme>
        )

        expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
        await user.click(screen.getByRole('button', { name: /cambiar tema/i }))
        expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')
    })

    /**
     * Comprueba que toggleTheme alterna el tema de dark a light al pulsarlo.
     */
    test('toggleTheme cambia el tema de dark a light', async () => {
        const user = userEvent.setup()
        localStorage.setItem('yovi-theme', 'dark')

        render(
            <Theme>
                <ThemeConsumer />
            </Theme>
        )

        expect(screen.getByTestId('theme-value')).toHaveTextContent('dark')
        await user.click(screen.getByRole('button', { name: /cambiar tema/i }))
        expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
    })

    /**
     * Comprueba que al cambiar el tema, el atributo data-theme del elemento <html>
     * se actualiza correctamente para que los estilos CSS del tema se apliquen.
     */
    test('actualiza el atributo data-theme del <html> al cambiar el tema', async () => {
        const user = userEvent.setup()
        localStorage.setItem('yovi-theme', 'light')

        render(
            <Theme>
                <ThemeConsumer />
            </Theme>
        )

        expect(document.documentElement.getAttribute('data-theme')).toBe('light')
        await user.click(screen.getByRole('button', { name: /cambiar tema/i }))
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    /**
     * Comprueba que al cambiar el tema, el nuevo valor se persiste en localStorage
     * para que la preferencia se mantenga entre sesiones.
     */
    test('persiste el tema en localStorage al cambiar', async () => {
        const user = userEvent.setup()
        localStorage.setItem('yovi-theme', 'light')

        render(
            <Theme>
                <ThemeConsumer />
            </Theme>
        )

        await user.click(screen.getByRole('button', { name: /cambiar tema/i }))
        expect(localStorage.getItem('yovi-theme')).toBe('dark')
    })

    /**
     * Comprueba que dos pulsaciones consecutivas de toggleTheme devuelven el tema
     * a su valor original, verificando que el ciclo light → dark → light funciona.
     */
    test('dos pulsaciones consecutivas devuelven el tema al valor original', async () => {
        const user = userEvent.setup()
        localStorage.setItem('yovi-theme', 'light')

        render(
            <Theme>
                <ThemeConsumer />
            </Theme>
        )

        await user.click(screen.getByRole('button', { name: /cambiar tema/i }))
        await user.click(screen.getByRole('button', { name: /cambiar tema/i }))
        expect(screen.getByTestId('theme-value')).toHaveTextContent('light')
    })

})
