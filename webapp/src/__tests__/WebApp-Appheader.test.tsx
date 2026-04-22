import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppHeader from '../components/header/AppHeader'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'
import { Theme } from '../screens/Theme'

// Wrapper que proporciona el contexto de tema necesario para AppHeader
function renderWithTheme(onLogout: () => void) {
    return render(
        <Theme>
            <AppHeader onLogout={onLogout} />
        </Theme>
    )
}

//Crea matchMedia mock, que se encarga de simular la función window.matchMedia en el entorno de pruebas.
//  window.MatchMedia es una función que se utiliza para detectar características de pantalla, como el modo oscuro o claro, 
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

        // El overlay cubre la pantalla y cierra el menú al hacer clic en él
        const overlay = document.querySelector('.app-header_overlay') as HTMLElement
        await user.click(overlay)

        expect(screen.queryByText(/modo oscuro|modo claro/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/idioma/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/cerrar sesión/i)).not.toBeInTheDocument()
    })


    /**
     * Comprueba que al pulsar el botón de cerrar sesión, se llama a la función onLogout
     * pasada como prop y el menú se cierra después de hacer clic.
     */
    test('llama a onLogout al pulsar cerrar sesión y cierra el menú', async () => {
        const user = userEvent.setup()
        const onLogout = vi.fn() // Mock de la función onLogout para verificar que se llama correctamente
        renderWithTheme(onLogout)

        await user.click(getMenuButton())
        await user.click(screen.getByRole('menuitem', { name: /cerrar sesión/i }))

        expect(onLogout).toHaveBeenCalledTimes(1)
        expect(screen.queryByRole('button', { name: /men[uú] de opciones/i })).not.toBeInTheDocument()
         expect(screen.getByText(/YOVI/i)).not.toBeInTheDocument()
        expect(screen.getByAltText(/yovi logo/i)).not.toBeInTheDocument()
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
     * correctamente, alternando el tema y actualizando el texto del botón en consecuencia.
     * Al pulsar el botón, el tema debe cambiar y el menú debe cerrarse después de la acción.
     * El texto del botón debe reflejar el estado actual del tema, mostrando "Modo claro" cuando el tema es oscuro y "Modo oscuro" cuando el tema es claro.
     */
    test('cambia el tema y actualiza el texto del botón', async () => {
        const user = userEvent.setup()
        renderWithTheme(vi.fn())
        await user.click(getMenuButton())

        const themeButton = screen.getByRole('menuitem', { name: /modo oscuro|modo claro/i })
        const initialText = themeButton.textContent
        await user.click(themeButton)

        // El menú se cierra después de cambiar el tema
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
        // El texto del botón debe cambiar al estado opuesto
        expect(themeButton.textContent).not.toBe(initialText)
    })

    /**
     * Comprueba que el appheader no aparezca en la pantalla de registro ni login
     */
        test('el appheader no aparece en la pantalla de registro ni login', () => {
            // Simulamos que estamos en la pantalla de registro
            window.history.pushState({}, 'Register', '/register') //Ir a la pantalla de registro
            renderWithTheme(vi.fn())
            expect(screen.queryByRole('button', { name: /men[uú] de opciones/i })).not.toBeInTheDocument()
            expect(screen.queryByText(/YOVI/i)).not.toBeInTheDocument()
            expect(screen.queryByAltText(/yovi logo/i)).not.toBeInTheDocument()
        })

    // /**
    //  * Comprueba que el appheader aparezca en la pantalla de home, stats y ranking, y en las subpantallas de stats y ranking
    //  **/
    //     test('el appheader aparece en la pantalla de home, stats y ranking', () => {
    //         // Simulamos que estamos en la pantalla de home
    //         window.history.pushState({}, 'Home', '/home') //Ir a la pantalla de home
    //         renderWithTheme(vi.fn())
    //         expect(screen.getByRole('button', { name: /👤 MENU/i })).toBeInTheDocument()
    //         expect(screen.getByText(/YOVI/i)).toBeInTheDocument()
    //         expect(screen.getByAltText(/yovi logo/i)).toBeInTheDocument()

    //         // Simulamos que estamos en la pantalla de stats
    //         window.history.pushState({}, 'Stats', '/stats') //Ir a la pantalla de stats
    //         renderWithTheme(vi.fn())
    //         expect(screen.getByRole('button', { name: /👤 MENU/i })).toBeInTheDocument()
    //         expect(screen.getByText(/YOVI/i)).toBeInTheDocument()
    //         expect(screen.getByAltText(/yovi logo/i)).toBeInTheDocument()

    //         // Simulamos que estamos en la pantalla de ranking
    //         window.history.pushState({}, 'Ranking', '/ranking') //Ir a la pantalla de ranking
    //         renderWithTheme(vi.fn())
    //         expect(screen.getByRole('button', { name: /👤 MENU/i })).toBeInTheDocument()
    //         expect(screen.getByText(/YOVI/i)).toBeInTheDocument()
    //         expect(screen.getByAltText(/yovi logo/i)).toBeInTheDocument()

    //         // Simulamos que estamos en la subpantalla de stats general
    //         window.history.pushState({}, 'Stats Detail', '/stats/general') //Ir a la subpantalla de stats
    //         renderWithTheme(vi.fn())
    //         expect(screen.getByRole('button', { name: /👤 MENU/i })).toBeInTheDocument()
    //         expect(screen.getByText(/YOVI/i)).toBeInTheDocument()
    //         expect(screen.getByAltText(/yovi logo/i)).toBeInTheDocument()

    //         // Simulamos que estamos en la subpantalla de stats por categoría
    //         window.history.pushState({}, 'Stats Filtrado', '/stats/filtarado') //Ir a la subpantalla de stats
    //         renderWithTheme(vi.fn())
    //         expect(screen.getByRole('button', { name: /👤 MENU/i })).toBeInTheDocument()
    //         expect(screen.getByText(/YOVI/i)).toBeInTheDocument()
    //         expect(screen.getByAltText(/yovi logo/i)).toBeInTheDocument()


    //         // Simulamos que estamos en las dos subpantallas de ranking general
    //         window.history.pushState({}, 'Ranking Detail', '/ranking/detail') //Ir a la subpantalla de ranking general
    //         renderWithTheme(vi.fn())
    //         expect(screen.getByRole('button', { name: /👤 MENU/i })).toBeInTheDocument()
    //         expect(screen.getByText(/YOVI/i)).toBeInTheDocument()
    //         expect(screen.getByAltText(/yovi logo/i)).toBeInTheDocument()
    //      }
    
})
