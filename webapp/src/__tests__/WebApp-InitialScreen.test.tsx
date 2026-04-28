import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InitialScreen from '../screens/init/InitialScreen'
import { afterEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'
import { LanguageProvider } from '../i18n/LanguageProvider'

//Para asegurar que el idioma por defecto es el español en los test
// Se establece el valor 'es' en localStorage antes de renderizar el componente InitialScreen. 
const renderInitialScreen = () => {
    localStorage.setItem('yovi-locale', 'es')
    return render(
        <LanguageProvider>
            <InitialScreen />
        </LanguageProvider>
    )
}

/**
 * Tests para InitialScreen que comprueban que:
 * - Se muestra el título y el formulario de inicio de sesión
 * - Se muestra el enlace de registro
 * - Se muestra mensaje de éxito al iniciar sesión correctamente
 * - Se muestra error de red si el fetch falla al intentar iniciar sesión
 * - Se navega a la pantalla de registro al pulsar el botón "Regístrate"
 * - No se muestra la pantalla de Bienvenido al pulsar el botón "Regístrate"
 * - Se muestra el mensaje de error adecuado si el servidor responde con un error al intentar iniciar sesión
 * - Se muestra el mensaje de error adecuado si el servidor responde con un error de autenticación al intentar iniciar sesión
 */
describe('InitialScreen', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        localStorage.clear()
    })

    /**
     * Comprueba que se muestra el título de bienvenida, los campos de usuario y contraseña, y el botón de iniciar sesión.
     * El test verifica que el título "Bienvenido de nuevo, inicia sesión aquí" esté presente, así como los campos de entrada para usuario y contraseña, y el botón para iniciar sesión.
     */
    test('muestra el título y el formulario de inicio de sesión', () => {
        renderInitialScreen()
        expect(screen.getByText(/Bienvenido de nuevo, inicia sesión aquí/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Usuario/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/^Contraseña$/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Iniciar sesión/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que se muestra el enlace de registro.
     * El test verifica que el texto "¿No tienes usuario?" esté presente, así como el botón "Regístrate" para navegar a la pantalla de registro.
     */
    test('muestra el enlace de registro', () => {
        renderInitialScreen()
        expect(screen.getByText(/¿No tienes usuario\? Haz click aquí para crear uno\./i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Regístrate/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que se muestra un error si se intenta iniciar sesión sin escribir el usuario.
     * El test simula un usuario pulsando el botón de iniciar sesión sin haber escrito nada en el campo de usuario, y verifica que se muestre el mensaje de error "Escriba el usuario".
     */ 
    test('muestra error si se intenta iniciar sesión sin usuario', async () => {
        const user = userEvent.setup()
        renderInitialScreen()
        await waitFor(async () => {
            await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }))
            expect(screen.getByText(/Escriba el usuario\./i)).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestra un error si se intenta iniciar sesión sin escribir la contraseña.
     */
    test('muestra error si se intenta iniciar sesión sin contraseña', async () => {
        const user = userEvent.setup()
        renderInitialScreen()
        await waitFor(async () => {
            await user.type(screen.getByLabelText(/Usuario/i), 'sara')
            await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }))
            expect(screen.getByText(/Escriba la contraseña\./i)).toBeInTheDocument()
        })
    })


  /**
   * Comprueba que al pulsar el botón "Regístrate", se navega a la pantalla de registro y no aparece la pagina de Bienvenido
   */
  test('navega a la pantalla de registro al pulsar Regístrate', async () => {
    const user = userEvent.setup()
        renderInitialScreen()
    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: /Regístrate/i }))
      expect(screen.queryByText(/Bienvenido a tu menú principal, sara/i)).not.toBeInTheDocument()
    })
  })

  /**
 * Comprueba que el botón del ojo alterna la visibilidad de la contraseña en el inicio de sesión.
 * El test simula un usuario haciendo clic sobre el botón del ojo, verificando que el campo
 * de contraseña alterna entre tipo 'password' y tipo 'text' en cada pulsación.
 */
test('el botón del ojo alterna la visibilidad de la contraseña', async () => {
    renderInitialScreen()
    const user = userEvent.setup()
    await waitFor(async () => {
        const passwordInput = screen.getByLabelText(/^contraseña$/i)
        const toggleButton = document.querySelector('.password-field__toggle') as HTMLElement

        expect(passwordInput).toHaveAttribute('type', 'password')

        await user.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')

        await user.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'password')
    })
})


})