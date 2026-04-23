import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Game } from '../screens/game/Game'
import { afterEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'
import { Difficulty } from '../components/gameOptions/Difficulty'
import { Strategy } from '../components/gameOptions/Strategy'

const baseSettings = {
    strategy: Strategy.RANDOM,
    difficulty: Difficulty.EASY
}

const boardStateMock = {
    ok: true,
    json: async () => ({
        state: { layout: '000/000/000' },
        status: { kind: 'Ongoing', next_player: 0 }
    })
}

function mockFetch() {
    global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ game_id: 'test-123' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ kind: 'Ongoing', next_player: 0 }) })
        .mockResolvedValue(boardStateMock)
}

describe('GameInfo', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    /**
     * En modo 2 jugadores GameInfo muestra:
     *   - Título "Información de partida"
     *   - "Tamaño del tablero" y "Estado"
     * Y NO muestra los campos exclusivos de 1 jugador:
     *   - Jugador, Oponente, Estrategia, Dificultad, Turno actual
     */
    test('muestra la información correcta en modo 2 jugadores', async () => {
        userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="iyan" twoPlayers={true} stateStart={true} />
        )
        await waitFor(() => {
            expect(screen.getByText(/Información de partida/i)).toBeInTheDocument()
            expect(screen.getByText(/Tamaño del tablero/i)).toBeInTheDocument()
            expect(screen.getByText(/Estado/i)).toBeInTheDocument()

            // Campos exclusivos de modo 1 jugador — NO deben aparecer en modo 2 jugadores
            expect(screen.queryByText(/Oponente/i)).not.toBeInTheDocument()
            expect(screen.queryByText(/Estrategia/i)).not.toBeInTheDocument()
            expect(screen.queryByText(/Turno actual/i)).not.toBeInTheDocument()
        })
    })

    /**
     * En modo 1 jugador GameInfo muestra:
     *   - Título "Información de partida"
     *   - Jugador (nombre del usuario), Oponente: BOT
     *   - Estrategia, Dificultad, Turno actual, Estado
     * Y NO muestra "Tamaño del tablero" (exclusivo de 2 jugadores)
     *
     * Nota: "sara" aparece dos veces en el DOM (en "Jugador" y en "Turno actual"),
     * por eso se usa getAllByText en lugar de getByText.
     */
    test('muestra la información correcta en modo 1 jugador (contra bot)', async () => {
        userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="" twoPlayers={false} stateStart={true} />
        )
        await waitFor(() => {
            expect(screen.getByText(/Información de partida/i)).toBeInTheDocument()

            // "sara" aparece en "Jugador" y en "Turno actual", usamos getAllByText
            expect(screen.getAllByText(/sara/i).length).toBeGreaterThan(0)
            expect(screen.getByText(/BOT/i)).toBeInTheDocument()
            expect(screen.getByText(/Oponente/i)).toBeInTheDocument()
            expect(screen.getByText(/Estrategia/i)).toBeInTheDocument()
            expect(screen.getByText(/Dificultad/i)).toBeInTheDocument()
            expect(screen.getByText(/Turno actual/i)).toBeInTheDocument()
            expect(screen.getByText(/Estado/i)).toBeInTheDocument()

            // Exclusivo de modo 2 jugadores — NO debe aparecer
            expect(screen.queryByText(/Tamaño del tablero/i)).not.toBeInTheDocument()
        })
    })
})
