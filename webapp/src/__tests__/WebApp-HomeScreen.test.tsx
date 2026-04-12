import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../screens/game/Home'
import { afterEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'

/**
 * Tests para Home que comprueban que:
 * - Se muestra el mensaje de bienvenida con el nombre de usuario
 * - Se muestran los botones del menú principal
 * - Se muestra el botón de empezar partida contra bot
 * - Se muestra el botón de empezar partida 2 jugadores
 * - Se muestra error si se intenta empezar partida 2 jugadores sin nombre para jugador 2
 * - No se muestra error si se intenta empezar partida 2 jugadores con nombre para jugador 2
 * - Se navega a la pantalla de estadísticas al pulsar el botón de Mis estadísticas
 * - Se navega a la pantalla de ranking al pulsar el botón de Ranking
 * - Se llama a /initmatch al pulsar el botón de empezar partida contra bot
 * - Se actualiza la selección de estrategia al seleccionar una opción
 */
describe('Home', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    /**
     * Comprueba que se muestra el mensaje de bienvenida con el nombre de usuario.
     * El test renderiza el componente Home con el prop username establecido en "sara", y verifica que se muestre el mensaje de bienvenida "Bienvenido a tu menú principal, sara" en la pantalla.
     */
    test('mensaje de bienvenida adecuado', () => {
        render(<Home username="sara" />)
        expect(screen.getByText(/Bienvenido a tu menú principal, sara/i)).toBeInTheDocument()
    })

    /**
     * Comprueba que se muestran los botones del menú principal.
     * El test renderiza el componente Home con el prop username establecido en "sara", y verifica que se muestren los botones "Mis estadísticas", "Ranking" y "Cerrar sesión" en la pantalla.
     */
    test('se muestran los botones del menú principal', () => {
        render(<Home username="sara" />)
        expect(screen.getByRole('button', { name: /mis estadísticas/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /ranking/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument()
    }) 

    /**
     * Comprueba que se muestra el botón de empezar partida contra bot.
     * El test renderiza el componente Home con el prop username establecido en "sara", y verifica que se muestre el botón "Empezar partida" para iniciar una partida contra el bot en la pantalla.
     */
    test('se muestra el botón de empezar partida contra bot', () => {
        render(<Home username="sara" />)
        expect(screen.getByRole('button', { name: /empezar partida$/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que se muestra el botón de empezar partida 2 jugadores.
     * El test renderiza el componente Home con el prop username establecido en "sara", y verifica que se muestre el botón "Empezar partida 2 jugadores" para iniciar una partida contra otro jugador en la pantalla.
     */
    test('se muestra el botón de empezar partida 2 jugadores', () => {
        render(<Home username="sara" />)
        expect(screen.getByRole('button', { name: /empezar partida 2 jugadores/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que se muestra error si se intenta empezar partida 2 jugadores sin nombre para jugador 2.
     * El test simula un usuario pulsando el botón de empezar partida 2 jugadores sin haber escrito nada en el campo de nombre para jugador 2, y verifica que se muestre el mensaje de error "El nombre del jugador 2 no puede estar vacío" en la pantalla.
     */
    test('se muestra error si se intenta empezar partida 2 jugadores sin nombre para jugador 2', async () => {
        render(<Home username="sara" />)
        const user = userEvent.setup()
        await waitFor(async () => {
            await user.click(screen.getByRole('button',{ name: /empezar partida 2 jugadores/i }))
            expect(screen.getByText(/El nombre del jugador 2 no puede estar vacío/i)).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que no se muestra error si se intenta empezar partida 2 jugadores con nombre para jugador 2.
     * El test simula un usuario escribiendo "iyan" en el campo de nombre para jugador 2 y pulsando el botón de empezar partida 2 jugadores, y verifica que no se muestre el mensaje de error "El nombre del jugador 2 no puede estar vacío" en la pantalla.
     */
    test('no se muestra error si el jugador 2 tiene un nombre', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) } as Response)
        render(<Home username="sara" />)
        await userEvent.type(screen.getByPlaceholderText(/Nombre del jugador 2/i), 'iyan')
        await userEvent.click(screen.getByRole('button', { name: /empezar partida 2 jugadores/i }))
        expect(screen.queryByText(/El nombre del jugador 2 no puede estar vacío/i)).not.toBeInTheDocument()
    })

    /**
     * Comprueba que se navega a la pantalla de estadísticas al pulsar el botón de Mis estadísticas.
     * El test simula un usuario pulsando el botón de Mis estadísticas, y verifica que se muestre el mensaje "Eliga que estadísticas desea ver" presente en la pantalla de selección de estadísticas.
     */
    test('se navega a la pantalla de estadísticas al pulsar el botón de Mis estadísticas', async () => {
        render(<Home username="sara" />)
        await userEvent.click(screen.getByRole('button', { name: /Mis estadísticas/i }))
        // GameStats se renderiza con el username
        await waitFor(() => {
            expect(screen.queryByText(/Eliga que estadísticas desea ver/i)).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se navega a la pantalla de ranking al pulsar el botón de Ranking.
     * El test simula un usuario pulsando el botón de Ranking, y verifica que se muestre el mensaje "Ranking global" presente en la pantalla de ranking.
     */
    test('se navega a la pantalla de ranking al pulsar el botón de Ranking', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ranking: [] }) } as Response)
        render(<Home username="sara" />)
        await userEvent.click(screen.getByRole('button', { name: /Ranking/i }))
        await waitFor(() => {
            expect(screen.queryByText(/Ranking global/i)).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se llama a /initmatch al pulsar el botón de empezar partida contra bot.
     * El test simula un usuario pulsando el botón de empezar partida contra bot, y verifica que se haya llamado a la URL correcta con el método POST para iniciar una nueva partida contra el bot.
     */
    test('se llama a /initmatch al pulsar el botón de empezar partida contra bot', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) } as Response)
        render(<Home username="sara" />)
        await userEvent.click(screen.getByRole('button', { name: /Empezar partida$/i }))
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/initmatch'),
                expect.objectContaining({ method: 'POST' })
            )
        })
    })

    /**
     * Comprueba que se actualiza la selección de estrategia al seleccionar una opción.
     * El test simula un usuario seleccionando la opción "RANDOM" en el desplegable de selección de estrategia, y verifica que el valor seleccionado en el desplegable se actualice a "RANDOM".
     */
    test('selecciona estrategia actualiza selección', async () => {
        render(<Home username="sara" />)
        const select = screen.getByRole('combobox')
        await userEvent.selectOptions(select, 'RANDOM')
        expect((select as HTMLSelectElement).value).toBe('RANDOM')
    })
})
