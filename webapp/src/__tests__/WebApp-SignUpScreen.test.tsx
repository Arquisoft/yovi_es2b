import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignUp from '../screens/init/SignUp'
import { afterEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'
import { renderWithProviders } from './test-utils'

/**
 * Tests para SignUp que comprueban que:
 * - Se muestra el título y el formulario de registro
 * - Se muestra el enlace de inicio de sesión
 * - Se crea el usuario correctamente y se llama a /createuser
 */
describe('SignUp', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    /**
     * Comprueba que se muestra el título de bienvenida, los campos de usuario y contraseña, y el botón de crear usuario.
     */
    test('muestra el título y el formulario de registro', () => {
        renderWithProviders(<SignUp />)
        expect(screen.getByText(/Bienvenido, regístrate aquí/i)).toBeInTheDocument()
        expect(screen.getByText(/Crea tu usuario y contraseña para registrarte en Yovi\./i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Usuario/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/^Contraseña$/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Crear usuario/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que se muestra el enlace de inicio de sesión.
     */
    test('muestra el enlace de inicio de sesión', () => {
        renderWithProviders(<SignUp />)
        expect(screen.getByText(/¿Ya tienes usuario\? Inicia sesión\./i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Atrás/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que se navega a la pantalla de login al pulsar el botón Atrás.
     */
    test('navega a la pantalla de login al pulsar Atrás', async () => {
        const user = userEvent.setup()
        renderWithProviders(<SignUp />)
        await waitFor(async () => {
            await user.click(screen.getByRole('button', { name: /Atrás/i }))
            expect(screen.queryByText(/Bienvenido, regístrate aquí/i)).not.toBeInTheDocument()
        })
    })

    /**
     * Comprueba que el botón del ojo alterna la visibilidad de la contraseña.
     * El test simula un usuario pulsando el botón del ojo para mostrar y ocultar la contraseña, 
     * y verifica que el campo de contraseña cambia su tipo entre "password" y "text" correctamente.
     */
    test('el botón del ojo alterna la visibilidad de la contraseña', async () => {
        renderWithProviders(<SignUp />)
        const user = userEvent.setup()
        await waitFor(async () => {
            const passwordInput = screen.getByLabelText(/^contraseña$/i)
            const toggleSwitch = document.querySelector('.password-field__toggle') as HTMLElement

            expect(passwordInput).toHaveAttribute('type', 'password')

            await user.click(toggleSwitch)
            expect(passwordInput).toHaveAttribute('type', 'text')

            await user.click(toggleSwitch)
            expect(passwordInput).toHaveAttribute('type', 'password')
        })
    })

    /**
 * Comprueba que el botón de crear usuario se deshabilita y cambia su texto mientras se procesa la petición.
 * El test simula un usuario rellenando el formulario y pulsando crear usuario, verificando que
 * el botón muestra "Creando usuario..." y está deshabilitado durante la carga.
 */
    test('el botón se deshabilita y muestra texto de carga mientras se procesa el registro', async () => {
        renderWithProviders(<SignUp />)
        const user = userEvent.setup()
        global.fetch = vi.fn().mockImplementation(() => new Promise(() => { })) // fetch que nunca resuelve
        await waitFor(async () => {
            await user.type(screen.getByLabelText(/usuario/i), 'sara')
            await user.type(screen.getByLabelText(/^contraseña$/i), 'Sara1234')
            await user.click(screen.getByRole('button', { name: /crear usuario/i }))
            expect(screen.getByRole('button', { name: /creando usuario/i })).toBeDisabled()
        })
    })

    /**
     * Comprueba que se muestra un error de red si la petición de registro falla.
     * El test simula un fallo de red en fetch y verifica que se muestra el mensaje de error
     * correspondiente en la pantalla.
     */
    test('se muestra error de red si la petición falla', async () => {
        renderWithProviders(<SignUp />)
        const user = userEvent.setup()
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
        await waitFor(async () => {
            await user.type(screen.getByLabelText(/usuario/i), 'sara')
            await user.type(screen.getByLabelText(/^contraseña$/i), 'Sara1234')
            await user.click(screen.getByRole('button', { name: /crear usuario/i }))
            expect(screen.getByText(/Network error/i)).toBeInTheDocument()
        })
    })
})