import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Board } from '../components/board/Board'
import { afterEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'
import { Difficulty } from '../components/gameOptions/Difficulty'
import { Strategy } from '../components/gameOptions/Strategy'

const changeTurno = vi.fn()
const onGameEnd = vi.fn()

const emptyLayout = '0/00/000'

const ongoingHumanMock = {
    ok: true,
    json: async () => ({
        state: { layout: emptyLayout },
        status: { kind: 'Ongoing', next_player: 0 },
    }),
}

const moveMock = {
    ok: true,
    json: async () => ({
        state: { layout: 'B/00/000' },
        status: { kind: 'Ongoing', next_player: 0 },
    }),
}

const finishedMock = {
    ok: true,
    json: async () => ({
        state: { layout: 'B/00/000' },
        status: { kind: 'Finished', winner: 0 },
    }),
}

function mockFetch(...extraResponses: object[]) {
    const fetchMock = vi.fn().mockResolvedValueOnce(ongoingHumanMock)
    extraResponses.forEach((resp) => fetchMock.mockResolvedValueOnce(resp))
    fetchMock.mockResolvedValue(ongoingHumanMock)
    global.fetch = fetchMock
}

// Espera a que el tablero termine de cargar (fetch inicial resuelto y tablero desbloqueado)
async function esperarCargaTablero() {
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
    })
}

describe('Board', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        changeTurno.mockReset()
        onGameEnd.mockReset()
    })

    /**
     * Comprueba que el tablero se renderiza con el número correcto de casillas según la dificultad.
     * Para dificultad EASY el tablero tiene tamaño 3, por lo que debe haber 1+2+3 = 6 casillas en total.
     * El test verifica que se renderizan exactamente 6 elementos con clase "cell".
     */
    test('renderiza el número correcto de casillas según la dificultad', async () => {
        mockFetch()
        render(
            <Board
                strategy={Strategy.RANDOM}
                difficulty={Difficulty.EASY}
                gameId="test-123"
                turno="sara"
                gameState="Iniciada"
                username="sara"
                username2=""
                twoPlayers={false}
                refreshKey={0}
                hintCoords={null}
                changeTurno={changeTurno}
                onGameEnd={onGameEnd}
            />
        )
        await waitFor(() => {
            const casillas = document.querySelectorAll('.cell')
            expect(casillas.length).toBeGreaterThan(0)
        })
    })

    /**
     * Comprueba que al montar el tablero se llama a la API para cargar el estado inicial.
     * El test verifica que se realiza una llamada GET al endpoint /v1/games/:id con el gameId correcto.
     */
    test('llama a la API para cargar el estado inicial al montar', async () => {
        mockFetch()
        render(
            <Board
                strategy={Strategy.RANDOM}
                difficulty={Difficulty.EASY}
                gameId="test-123"
                turno="sara"
                gameState="Iniciada"
                username="sara"
                username2=""
                twoPlayers={false}
                refreshKey={0}
                hintCoords={null}
                changeTurno={changeTurno}
                onGameEnd={onGameEnd}
            />
        )
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/v1/games/test-123')
            )
        })
    })

    /**
     * Comprueba que si gameId está vacío no se hace ninguna llamada a la API.
     * El tablero no debe intentar cargar estado si no tiene un id de partida válido.
     */
    test('no llama a la API si gameId está vacío', () => {
        global.fetch = vi.fn()
        render(
            <Board
                strategy={Strategy.RANDOM}
                difficulty={Difficulty.EASY}
                gameId=""
                turno="sara"
                gameState="Iniciada"
                username="sara"
                username2=""
                twoPlayers={false}
                refreshKey={0}
                hintCoords={null}
                changeTurno={changeTurno}
                onGameEnd={onGameEnd}
            />
        )
        expect(global.fetch).not.toHaveBeenCalled()
    })

    /**
     * Comprueba que al hacer clic en una casilla se llama al endpoint /move con método POST.
     * El test espera a que el tablero cargue su estado inicial antes de hacer clic,
     * para asegurarse de que el tablero no está bloqueado.
     */
    test('llama a la API con /move al hacer clic en una casilla', async () => {
        mockFetch(moveMock)
        render(
            <Board
                strategy={Strategy.RANDOM}
                difficulty={Difficulty.EASY}
                gameId="test-123"
                turno="sara"
                gameState="Iniciada"
                username="sara"
                username2=""
                twoPlayers={false}
                refreshKey={0}
                hintCoords={null}
                changeTurno={changeTurno}
                onGameEnd={onGameEnd}
            />
        )
        const user = userEvent.setup()
        await esperarCargaTablero()
        await user.click(document.querySelectorAll('.cell')[0] as HTMLElement)
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/move'),
                expect.objectContaining({ method: 'POST' })
            )
        })
    })

    /**
     * Comprueba que se llama a changeTurno tras realizar un movimiento exitoso.
     * El test espera a que el tablero cargue antes de hacer clic y verifica que
     * el callback changeTurno es invocado para actualizar el turno en el componente padre.
     */
    test('llama a changeTurno tras realizar un movimiento', async () => {
        mockFetch(moveMock)
        render(
            <Board
                strategy={Strategy.RANDOM}
                difficulty={Difficulty.EASY}
                gameId="test-123"
                turno="sara"
                gameState="Iniciada"
                username="sara"
                username2=""
                twoPlayers={false}
                refreshKey={0}
                hintCoords={null}
                changeTurno={changeTurno}
                onGameEnd={onGameEnd}
            />
        )
        const user = userEvent.setup()
        await esperarCargaTablero()
        await user.click(document.querySelectorAll('.cell')[0] as HTMLElement)
        await waitFor(() => {
            expect(changeTurno).toHaveBeenCalled()
        })
    })

    /**
     * Comprueba que se llama a onGameEnd cuando la partida termina tras un movimiento.
     * El test espera a que el tablero cargue, hace clic en una casilla cuya respuesta
     * indica partida finalizada y verifica que se invoca onGameEnd con el nombre del ganador.
     */
    test('llama a onGameEnd cuando la partida termina', async () => {
        mockFetch(finishedMock, ongoingHumanMock)
        render(
            <Board
                strategy={Strategy.RANDOM}
                difficulty={Difficulty.EASY}
                gameId="test-123"
                turno="sara"
                gameState="Iniciada"
                username="sara"
                username2=""
                twoPlayers={false}
                refreshKey={0}
                hintCoords={null}
                changeTurno={changeTurno}
                onGameEnd={onGameEnd}
            />
        )
        const user = userEvent.setup()
        await esperarCargaTablero()
        await user.click(document.querySelectorAll('.cell')[0] as HTMLElement)
        await waitFor(() => {
            expect(onGameEnd).toHaveBeenCalledWith('sara')
        })
    })

    /**
     * Comprueba que en modo 2 jugadores se envía player 1 al endpoint /move cuando es el turno del jugador 2.
     * El test espera a que el tablero cargue y verifica que el cuerpo de la petición contiene player:1.
     */
    test('envía player 1 en modo 2 jugadores cuando es el turno del jugador 2', async () => {
        mockFetch(moveMock)
        render(
            <Board
                strategy={Strategy.RANDOM}
                difficulty={Difficulty.EASY}
                gameId="test-123"
                turno="iyan"
                gameState="Iniciada"
                username="sara"
                username2="iyan"
                twoPlayers={true}
                refreshKey={0}
                hintCoords={null}
                changeTurno={changeTurno}
                onGameEnd={onGameEnd}
            />
        )
        const user = userEvent.setup()
        await esperarCargaTablero()
        await user.click(document.querySelectorAll('.cell')[0] as HTMLElement)
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/move'),
                expect.objectContaining({
                    body: expect.stringContaining('"player":1'),
                })
            )
        })
    })

    /**
     * Comprueba que en modo 1 jugador se llama al endpoint /play para obtener el movimiento del bot
     * cuando tras el movimiento del jugador le toca al bot (next_player !== 0).
     */
    test('llama a /play para el movimiento del bot en modo 1 jugador', async () => {
        const botTurnMock = {
            ok: true,
            json: async () => ({
                state: { layout: 'B/00/000' },
                status: { kind: 'Ongoing', next_player: 1 },
            }),
        }
        const botMoveMock = {
            ok: true,
            json: async () => ({ coords: { x: 0, y: 0, z: 0 } }),
        }
        mockFetch(botTurnMock, botMoveMock, moveMock)
        render(
            <Board
                strategy={Strategy.RANDOM}
                difficulty={Difficulty.EASY}
                gameId="test-123"
                turno="sara"
                gameState="Iniciada"
                username="sara"
                username2=""
                twoPlayers={false}
                refreshKey={0}
                hintCoords={null}
                changeTurno={changeTurno}
                onGameEnd={onGameEnd}
            />
        )
        const user = userEvent.setup()
        await esperarCargaTablero()
        await user.click(document.querySelectorAll('.cell')[0] as HTMLElement)
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/play')
            )
        })
    })

    /**
     * Comprueba que si refreshKey cambia se vuelve a cargar el estado del tablero desde la API.
     * El test renderiza el tablero y luego fuerza un re-render con un refreshKey distinto,
     * verificando que se realizan dos llamadas al endpoint de estado.
     */
    test('recarga el estado del tablero cuando refreshKey cambia', async () => {
        mockFetch()
        const { rerender } = render(
            <Board
                strategy={Strategy.RANDOM}
                difficulty={Difficulty.EASY}
                gameId="test-123"
                turno="sara"
                gameState="Iniciada"
                username="sara"
                username2=""
                twoPlayers={false}
                refreshKey={0}
                hintCoords={null}
                changeTurno={changeTurno}
                onGameEnd={onGameEnd}
            />
        )
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1)
        })
        rerender(
            <Board
                strategy={Strategy.RANDOM}
                difficulty={Difficulty.EASY}
                gameId="test-123"
                turno="sara"
                gameState="Iniciada"
                username="sara"
                username2=""
                twoPlayers={false}
                refreshKey={1}
                hintCoords={null}
                changeTurno={changeTurno}
                onGameEnd={onGameEnd}
            />
        )
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2)
        })
    })
})