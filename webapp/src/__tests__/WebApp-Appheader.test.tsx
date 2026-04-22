import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppHeader from '../components/header/AppHeader'
import { afterEach, describe, expect, test, vi } from 'vitest'
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
        expect(screen.getByAltText(/yovi logo/i)).toBeInTheDocument()
        expect(screen.getByText(/YOVI/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /👤 MENU/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que el menú desplegable no se muestra al cargar el componente.
     * Por defecto el menú debe estar cerrado, por lo que las opciones de modo oscuro,
     * idioma y cerrar sesión no deben estar visibles en el DOM.
     */
    test('el menú está cerrado por defecto', () => {
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
        
        await user.click(screen.getByRole('button', { name: /👤 MENU/i }))

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

        await user.click(screen.getByRole('button', { name: /👤 MENU/i }))
        expect(screen.getByText(/modo oscuro|modo claro/i)).toBeInTheDocument()
        expect(screen.getByText(/idioma/i)).toBeInTheDocument()
        expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /👤 MENU/i }))
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

        await user.click(screen.getByRole('button', { name: /menú de opciones/i }))
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

        await user.click(screen.getByRole('button', { name: /👤 MENU/i }))
        await user.click(screen.getByRole('menuitem', { name: /cerrar sesión/i }))

        expect(onLogout).toHaveBeenCalledTimes(1)
        expect(screen.queryByRole('button', { name: /👤 MENU/i })).not.toBeInTheDocument()
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

        await user.click(screen.getByRole('button', { name: /👤 MENU/i }))
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

        await user.click(screen.getByRole('button', { name: /👤 MENU/i }))
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
        await user.click(screen.getByRole('button', { name: /👤 MENU/i }))

        const themeButton = screen.getByRole('menuitem', { name: /modo oscuro|modo claro/i })
        const initialText = themeButton.textContent
        await user.click(themeButton)

        // El menú se cierra después de cambiar el tema
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
        // El texto del botón debe cambiar al estado opuesto
        expect(themeButton.textContent).not.toBe(initialText)
    })

    /**
     * Comprueba que el appheader no aparezca en la pantalla de login, pero sí en el resto de pantallas.
     */
    
})
