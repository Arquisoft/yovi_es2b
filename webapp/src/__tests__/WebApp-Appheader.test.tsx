import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppHeader from '../components/header/AppHeader'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'
import { Theme } from '../screens/modo_tema/Theme'
import { LanguageProvider } from '../i18n/LanguageProvider'

// Forzar idioma español para los tests
beforeEach(() => {
    localStorage.setItem('yovi-locale', 'es')
})

// Wrapper que proporciona el contexto de tema e idioma necesario para AppHeader
function renderWithTheme(onLogout: () => void) {
    localStorage.setItem('yovi-locale', 'es')
    return render(
        <LanguageProvider>
            <Theme>
                <AppHeader onLogout={onLogout} />
            </Theme>
        </LanguageProvider>
    )
}

// Crea matchMedia mock, que se encarga de simular la función window.matchMedia en el entorno de pruebas.
// window.MatchMedia es una función que se utiliza para detectar características de pantalla, como el modo oscuro o claro, 
// El mock devuelve un objeto con la propiedad matches establecida en false (indicando que no se cumple la condición de media query) y métodos addEventListener y removeEventListener vacíos para evitar errores al intentar agregar o eliminar listeners en el entorno de pruebas.
beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockReturnValue({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }),
    })
})

function getMenuButton() {
    return screen.getByRole('button', { name: /men[uú] de opciones/i })
}

/**
 * Tests para AppHeader que comprueban que:
 * - El header se renderiza correctamente con el logo y el botón de menú
 * - El menú desplegable se abre y se cierra al hacer clic en el botón
 * - El botón de modo oscuro/claro aparece en el menú y cambia el tema al pulsarlo
 * - El botón de cerrar sesión llama a la función onLogout al pulsarlo
 * - El menú se cierra al hacer clic fuera de él
 * - La barra de menu appheader sale en todas las pantallas menos en la pantalla de login
 */
describe('AppHeader', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        localStorage.clear()
    })

    /**
     * Comprueba que el header se renderiza correctamente con el logo YOVI y el botón de menú.
     * El logo debe estar presente en el DOM con el texto alternativo "YOVI Logo",
     * y el botón de menú debe estar disponible para interactuar.
     */
    test('renderiza el logo y el botón de menú', () => {
        renderWithTheme(vi.fn())
        expect(screen.getByAltText(/yovi logo/i)).toBeInTheDocument()
        expect(screen.getByText(/YOVI/i)).toBeInTheDocument()
        expect(getMenuButton()).toBeInTheDocument()
    })

    /**
     * Comprueba que el menú desplegable no se muestra al cargar el componente.
     * Por defecto el menú debe estar cerrado, por lo que las opciones de modo oscuro,
     * idioma y cerrar sesión no deben estar visibles en el DOM.
     */
    test('el menú está cerrado por defecto', () => {
        renderWithTheme(vi.fn())
        expect(screen.queryByText(/modo oscuro|modo claro/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/idioma/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/cerrar sesión/i)).not.toBeInTheDocument()
    })

    /**
     * Comprueba que al hacer clic en el botón de menú, se abre el menú desplegable
     * mostrando las opciones disponibles: modo oscuro/claro, idioma y cerrar sesión.
     */
    test('abre el menú desplegable al hacer clic en el botón', async () => {
        const user = userEvent.setup()
        renderWithTheme(vi.fn())

        await user.click(getMenuButton())

        expect(screen.getByText(/modo oscuro|modo claro/i)).toBeInTheDocument()
        expect(screen.getByText(/idioma/i)).toBeInTheDocument()
        expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument()
    })

    /**
     * Comprueba que al hacer clic de nuevo en el botón de menú estando abierto,
     * el menú se cierra y las opciones dejan de estar visibles en el DOM.
     */
    test('cierra el menú al hacer clic de nuevo en el botón', async () => {
        const user = userEvent.setup()
        renderWithTheme(vi.fn())

        await user.click(getMenuButton())
        expect(screen.getByText(/modo oscuro|modo claro/i)).toBeInTheDocument()
        expect(screen.getByText(/idioma/i)).toBeInTheDocument()
        expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument()

        await user.click(getMenuButton())
        expect(screen.queryByText(/modo oscuro|modo claro/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/idioma/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/cerrar sesión/i)).not.toBeInTheDocument()
    })

    /**
     * Comprueba que al hacer clic fuera del menú desplegable,
     * el menú se cierra correctamente gracias al overlay que cubre el resto de la pantalla.
     */
    test('cierra el menú al hacer clic fuera de él (overlay)', async () => {
        const user = userEvent.setup()
        renderWithTheme(vi.fn())

        await user.click(getMenuButton())
        expect(screen.getByRole('menu')).toBeInTheDocument()

        const overlay = document.querySelector('.app-header_overlay') as HTMLElement
        await user.click(overlay)

        expect(screen.queryByText(/modo oscuro|modo claro/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/idioma/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/cerrar sesión/i)).not.toBeInTheDocument()
    })

    /**
     * Comprueba que al pulsar el botón de cerrar sesión, se llama a la función onLogout
     * pasada como prop exactamente una vez y el menú se cierra después de hacer clic.
     * AppHeader no se desmonta a sí mismo al cerrar sesión: esa responsabilidad recae
     * en el componente padre que decide qué pantalla mostrar tras el logout.
     */
    test('llama a onLogout al pulsar cerrar sesión y cierra el menú', async () => {
        const user = userEvent.setup()
        const onLogout = vi.fn()
        renderWithTheme(onLogout)

        await user.click(getMenuButton())
        await user.click(screen.getByRole('menuitem', { name: /cerrar sesión/i }))

        expect(onLogout).toHaveBeenCalledTimes(1)
        // El menú se cierra tras el logout, pero el header permanece en el DOM
        // porque es el padre quien decide desmontar AppHeader al cambiar de pantalla
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    /**
     * Comprueba que al pulsar el botón de modo oscuro/claro, el menú se cierra
     * después del cambio. La opción debe estar disponible y ser interactuable.
     */
    test('cierra el menú al cambiar el tema', async () => {
        const user = userEvent.setup()
        renderWithTheme(vi.fn())

        await user.click(getMenuButton())
        await user.click(screen.getByRole('menuitem', { name: /modo oscuro|modo claro/i }))

        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    /**
     * Comprueba que el botón de modo oscuro/claro no llama a onLogout al pulsarlo.
     * La función de cerrar sesión solo debe invocarse desde el botón correspondiente.
     */
    test('no llama a onLogout al cambiar el tema', async () => {
        const user = userEvent.setup()
        const onLogout = vi.fn()
        renderWithTheme(onLogout)

        await user.click(getMenuButton())
        await user.click(screen.getByRole('menuitem', { name: /modo oscuro|modo claro/i }))

        expect(onLogout).not.toHaveBeenCalled()
    })

    /**
     * Comprueba que el botón para cambiar de modo oscuro a claro y viceversa funciona
     * correctamente, alternando el tema al pulsarlo y cerrando el menú.
     * Para verificar el cambio de texto se reabre el menú tras la pulsación,
     * ya que el elemento desaparece del DOM cuando el menú se cierra.
     */
    test('cambia el tema y actualiza el texto del botón', async () => {
        const user = userEvent.setup()
        localStorage.setItem('yovi-theme', 'light')
        renderWithTheme(vi.fn())

        // Primera apertura: el tema es light, el botón debe decir "Modo oscuro"
        await user.click(getMenuButton())
        expect(screen.getByRole('menuitem', { name: /modo oscuro/i })).toBeInTheDocument()

        // Pulsamos para cambiar el tema; el menú se cierra
        await user.click(screen.getByRole('menuitem', { name: /modo oscuro/i }))
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()

        // Reabrimos el menú: ahora el tema es dark, el botón debe decir "Modo claro"
        await user.click(getMenuButton())
        expect(screen.getByRole('menuitem', { name: /modo claro/i })).toBeInTheDocument()
    })

})
