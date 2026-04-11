import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../screens/game/Home'
import { afterEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'

describe('Home', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    test('shows wellcome message with username', () => {
        render(<Home username="sara" />)
        expect(screen.getByText(/Bienvenido a tu menú principal, sara/i)).toBeInTheDocument()
    })

    test('shows main menu buttons', () => {
        render(<Home username="sara" />)
        expect(screen.getByRole('button', { name: /mis estadísticas/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /ranking/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument()
    }) 

    test('shows the start match button against bot', () => {
        render(<Home username="sara" />)
        expect(screen.getByRole('button', { name: /empezar partida$/i })).toBeInTheDocument()
    })

    test('shows the start match button for 2 players', () => {
        render(<Home username="sara" />)
        expect(screen.getByRole('button', { name: /empezar partida 2 jugadores/i })).toBeInTheDocument()
    })

    test('shows error if trying to start 2-player game without name', async () => {
        render(<Home username="sara" />)
        const user = userEvent.setup()
        await waitFor(async () => {
            await user.click(screen.getByRole('button',{ name: /empezar partida 2 jugadores/i }))
            expect(screen.getByText(/El nombre del jugador 2 no puede estar vacío/i)).toBeInTheDocument()
        })
    })

    test('does not show error if player 2 has a name', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) } as Response)
        render(<Home username="sara" />)
        await userEvent.type(screen.getByPlaceholderText(/Nombre del jugador 2/i), 'iyan')
        await userEvent.click(screen.getByRole('button', { name: /empezar partida 2 jugadores/i }))
        expect(screen.queryByText(/El nombre del jugador 2 no puede estar vacío/i)).not.toBeInTheDocument()
    })

    test('browse to go to stats screen', async () => {
        render(<Home username="sara" />)
        await userEvent.click(screen.getByRole('button', { name: /Mis estadísticas/i }))
        // GameStats se renderiza con el username
        await waitFor(() => {
            expect(screen.queryByText(/Eliga que estadísticas desea ver/i)).toBeInTheDocument()
        })
    })

    test('browse to go to ranking screen', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ranking: [] }) } as Response)
        render(<Home username="sara" />)
        await userEvent.click(screen.getByRole('button', { name: /Ranking/i }))
        await waitFor(() => {
            expect(screen.queryByText(/Ranking global/i)).toBeInTheDocument()
        })
    })

    test('start match vs bot calling /initmatch', async () => {
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

    test('start match vs bot calling /initmatch', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) } as Response)
        render(<Home username="sara" />)
        const btnFacil = screen.getByRole('button', { name: /fácil/i })
        await userEvent.click(btnFacil)
        expect(btnFacil.className).toMatch(/active/)
    })

    test('select strategy updates selection', async () => {
        render(<Home username="sara" />)
        const select = screen.getByRole('combobox')
        await userEvent.selectOptions(select, 'RANDOM')
        expect((select as HTMLSelectElement).value).toBe('RANDOM')
    })
})
