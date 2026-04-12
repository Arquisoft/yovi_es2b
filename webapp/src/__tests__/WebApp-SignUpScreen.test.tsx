import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignUp from '../screens/init/SignUp'
import { afterEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'

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
        render(<SignUp />)
        expect(screen.getByText(/Bienvenido, regístrate aquí/i)).toBeInTheDocument()
        expect(screen.getByText(/Crea tu usuario y contraseña para registrarte en Yovi\./i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Usuario/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Crear usuario/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que se muestra el enlace de inicio de sesión.
     */
    test('muestra el enlace de inicio de sesión', () => {
        render(<SignUp />)
        expect(screen.getByText(/¿Ya tienes usuario\? Inicia sesión\./i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Atrás/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que se crea el usuario correctamente y se llama a /createuser.
     */
/*     test('crea usuario correctamente y llama a /createuser', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Se creó el usuario sara' }),
        } as Response)
        render(<SignUp />)
        await waitFor(async () => {
            await user.type(screen.getByLabelText(/Usuario/i), 'sara')
            await user.type(screen.getByLabelText(/Contraseña/i), 'Sara1234')
            await user.click(screen.getByRole('button', { name: /Crear usuario/i }))
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/createuser'),
                expect.objectContaining({ method: 'POST' })
            )
        })
    }) */

    /**
     * Comprueba que se muestra un error si el usuario ya existe.
     */
/*     test('muestra error si el usuario ya existe', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'El usuario ya existe' }),
        } as Response)
        render(<SignUp />)
        await waitFor(async () => {
            await user.type(screen.getByLabelText(/Usuario/i), 'sara')
            await user.type(screen.getByLabelText(/Contraseña/i), 'Sara1234')
            await user.click(screen.getByRole('button', { name: /Crear usuario/i }))
            expect(screen.getByText(/El usuario 'sara' ya existe. Prueba con otro nombre de usuario\./i)).toBeInTheDocument()
        })
    }) */

    /**
     * Comprueba que se muestra un error si el servidor devuelve un error al crear el usuario.
     */
/*     test('muestra error de red si el fetch falla', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))
        render(<SignUp />)
        await waitFor(async () => {
            await user.type(screen.getByLabelText(/Usuario/i), 'sara')
            await user.type(screen.getByLabelText(/Contraseña/i), 'Sara1234')
            await user.click(screen.getByRole('button', { name: /Crear usuario/i }))
            expect(screen.getByText(/Network error/i)).toBeInTheDocument()
        })
    }) */

    /**
     * Comprueba que se navega a la pantalla de login al pulsar el botón Atrás.
     */
    test('navega a la pantalla de login al pulsar Atrás', async () => {
        const user = userEvent.setup()
        render(<SignUp />)
        await waitFor(async () => {
            await user.click(screen.getByRole('button', { name: /Atrás/i }))
            expect(screen.queryByText(/Bienvenido, regístrate aquí/i)).not.toBeInTheDocument()
        })
    })
})
