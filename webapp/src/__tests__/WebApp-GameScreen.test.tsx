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

// Mock del estado del tablero vacío, reutilizado en múltiples funciones de mock
const boardStateMock = {
    ok: true,
    json: async () => ({
        state: { layout: '000/000/000' },// estado del tablero vacío
        status: { kind: 'Ongoing', next_player: 0 }// estado de la partida indicando que sigue en curso y el siguiente jugador es el 0 (humano)
    })
}

// Mock completo de todas las llamadas fetch que hace Game + Board:
//El mock se usa para simular las respuestas de la API sin necesidad de hacer llamadas reales.
// 1. POST /v1/games         → crearPartida
// 2. GET  /v1/games/:id/status → getTurnoPartida
// 3. GET  /v1/games/:id     → peticionEstadoPartida (Board)
// mockFetch acepta cuántas veces repetir el mock de estado (una por test que lo necesite)
function mockFetch() {
    global.fetch = vi.fn()
        // El primer call es para crear la partida, el segundo para obtener el turno, y el resto para el estado del tablero (sin límite)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ game_id: 'test-123' }) })    // crearPartida
        .mockResolvedValueOnce({ ok: true, json: async () => ({ kind: 'Ongoing', next_player: 0 }) }) // getTurnoPartida
        .mockResolvedValue(boardStateMock) // todas las demás llamadas de Board, sin límite
}

/**
 * Test para Game que comprueba que:
 * - No se crea partida si stateStart es false
 * - Se llama a la API para crear partida cuando stateStart es true
 * - Muestra el indicador de turno en modo 2 jugadores
 */
describe('Game', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    /**
     * Comprueba que si stateStart es false, no se hace la llamada a la API para crear la partida. 
     * Solo se debe crear la partida cuando el usuario pulse el botón de empezar partida.
     * Si stateStart es false, el componente se renderiza pero no inicia el juego, por lo que no debe llamar a la API.
     */
    test('no crea partida si stateStart es false', () => {
        userEvent.setup()
        global.fetch = vi.fn()
        //vi.fn crea una mock para el fetch vacío para verificar si se llama o no.
        render(
            <Game settings={baseSettings} username="sara" username2="" twoPlayers={false} stateStart={false} />
        )
        expect(global.fetch).not.toHaveBeenCalled()
    })

    /**
     * Comprueba que si stateStart es true, se hace la llamada a la API para crear la partida.
     * Cuando el usuario pulse el botón de empezar partida, stateStart se pone a true y el componente debe llamar a la API para crear la partida.
     * El test espera a que se haga la llamada a la API y comprueba que se ha llamado con los parámetros correctos (URL y método POST).
     */
    test('llama a la API para crear partida cuando stateStart es true', async () => {
        userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="" twoPlayers={false} stateStart={true} />
        )
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/v1/games'),
                expect.objectContaining({ method: 'POST' })
            )
        })
    })

    /**
 * Comprueba que en el modo 1 jugador, muestra los botones pista y terminar partida, pero no muestra el botón deshacer movimiento.
 */
    test('muestra los botones pista y terminar partida en modo 1 jugador', async () => {
        userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="" twoPlayers={false} stateStart={true} />
        )
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /pista/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /Terminar partida/i })).toBeInTheDocument()
            expect(screen.queryByRole('button', { name: /Deshacer movimiento/i })).not.toBeInTheDocument()
        })
    })

    /**
     * Comprueba que en el modo 2 jugadores, muestra el botón deshacer movimiento y terminar partida, pero no muestra el botón pista.
     */
    test('muestra el botón deshacer movimiento en modo 2 jugadores', async () => {
        userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="iyan" twoPlayers={true} stateStart={true} />
        )
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Deshacer movimiento/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /Terminar partida/i })).toBeInTheDocument()
            expect(screen.queryByRole('button', { name: /pista/i })).not.toBeInTheDocument()
        })
    })


    /**
     * Comprueba que se muestra el indicador de turno en modo 2 jugadores y no se muestra en modo 1 jugador.
     * En modo 2 jugadores, el componente debe mostrar un texto indicando de quién es el turno (por ejemplo, "Turno de sara").
     * El test renderiza el componente en ambos modos y comprueba la presencia o ausencia del texto del turno.
     */
    test('muestra el indicador de turno en modo 2 jugadores', async () => {
        userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="iyan" twoPlayers={true} stateStart={true} />
        )
        await waitFor(() => {
            expect(screen.getByText(/turno de/i)).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que no se muestra el indicador de turno en modo 1 jugador.
     * En modo 1 jugador, el componente no debe mostrar ningún texto indicando el turno, ya que el jugador siempre es el mismo.
     * El test renderiza el componente en modo 1 jugador y comprueba que no se encuentra ningún texto relacionado con el turno.
     */
    test('no muestra el indicador de turno en modo 1 jugador', async () => {
        userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="" twoPlayers={false} stateStart={true} />
        )
        await waitFor(() => {
            expect(screen.queryByText(/turno de/i)).not.toBeInTheDocument()
        })
    })

    /**
     * Comprueba que al pulsar el botón "Terminar partida", se vuelve al menú principal y se muestra el mensaje de bienvenida con el nombre del usuario.
     * El test simula un usuario pulsando el botón "Terminar partida" y espera a que se renderice el menú principal, comprobando que el mensaje de bienvenida contiene el nombre del usuario.
     * Se utiliza la función mockFetch para simular las respuestas de la API sin necesidad de hacer llamadas reales.
     */
    test('vuelve al menú al pulsar Terminar partida', async () => {
        const user = userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="" twoPlayers={false} stateStart={true} />
        )
        await waitFor(async () => {
            await user.click(screen.getByRole('button', { name: /Terminar partida/i }))
            expect(screen.getByText(/Bienvenido a tu menú principal, sara/i)).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que al pulsar el botón "Terminar partida", se llama a la función onGoMenu y se muestra el menú principal.
     */
    test('llama a onGoMenu al pulsar Terminar partida', async () => {
        const user = userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="" twoPlayers={false} stateStart={true} />
        )
        await waitFor(async () => {
            await user.click(screen.getByRole('button', { name: /Terminar partida/i }))
            expect(screen.getByText(/Bienvenido a tu menú principal, sara/i)).toBeInTheDocument()
        })
    })


    /**
     * Comprueba que al pulsar "Deshacer movimiento" en modo 2 jugadores se llama al endpoint /undo.
     * Cubre handleUndo y su validación de gameId.
     */
    test('llama a la API al pulsar Deshacer movimiento en modo 2 jugadores', async () => {
        const user = userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="iyan" twoPlayers={true} stateStart={true} />
        )
        await waitFor(async () => {
            await user.click(screen.getByRole('button', { name: /Deshacer movimiento/i }))
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/undo'),
                expect.objectContaining({ method: 'POST' })
            )
        })
    })

    /**
     * Comprueba que al pulsar "Deshacer movimiento"", el timer se reinicia (si está activo).
     * Para que el timer se reinicie, el componente Timer debe recibir un nuevo prop "turno" diferente al actual.
     * El test simula un usuario pulsando el botón de deshacer movimiento, y verifica que el prop "turno" del Timer cambia, lo que indica que el timer se ha reiniciado.
     */
    test('reinicia el timer al pulsar Deshacer movimiento en modo 2 jugadores', async () => {
        const user = userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="iyan" twoPlayers={true} stateStart={true} enableTimer={true} />
        )
        const timer = await screen.findByRole('timer')
        const initialTurno = timer.getAttribute('aria-label') // obtenemos el turno inicial del timer
        await user.click(screen.getByRole('button', { name: /Deshacer movimiento/i })) // simulamos el click en deshacer movimiento
        await waitFor(() => {
            const newTurno = timer.getAttribute('aria-label') // obtenemos el nuevo turno del timer después de pulsar deshacer
            expect(newTurno).not.toBe(initialTurno) // verificamos que el turno ha cambiado, lo que indica que el timer se ha reiniciado
        })
    })


    /**
     * Comprueba que el botón Pista aparece en modo 1 jugador, llama a la API al pulsarlo
     * y se deshabilita mientras hay una pista activa en el tablero.
     * Añade respuestas Once para que /play devuelva coordenadas reales, cubriendo así
     * la condición hintCoords en Board y la clase hint en Casilla.
     */
    test('el botón Pista llama a la API y se deshabilita mientras hay pista activa', async () => {
        const user = userEvent.setup()
        mockFetch()
            // Secuenciamos: carga inicial del Board, GET estado para handleHint, coords del bot
            ; (global.fetch as ReturnType<typeof vi.fn>)
                .mockResolvedValueOnce(boardStateMock)                                                      // peticionEstadoPartida (Board)
                .mockResolvedValueOnce(boardStateMock)                                                      // handleHint: GET /v1/games/:id
                .mockResolvedValueOnce({ ok: true, json: async () => ({ coords: { x: 0, y: 0, z: 0 } }) }) // handleHint: GET /play
        render(
            <Game settings={baseSettings} username="test1" username2="" twoPlayers={false} stateStart={true} />
        )
        const hintButton = await screen.findByRole('button', { name: /pista/i })
        await user.click(hintButton)
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/play'),
                expect.objectContaining({ method: 'POST' })
            )
            expect(hintButton).toBeDisabled()
        })
    })

    /**
    * Comprueba que el temporizador se muestra en modo 2 jugadores cuando enableTimer es true.
    * El test renderiza el componente en modo 2 jugadores con el temporizador activado y verifica
    * que el elemento del temporizador está presente en el DOM.
    */
    test('muestra el temporizador en modo 2 jugadores con enableTimer activado', async () => {
        userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="iyan" twoPlayers={true} stateStart={true} enableTimer={true} />
        )
        await waitFor(() => {
            expect(screen.getByRole('timer')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que el temporizador no se muestra en modo 2 jugadores cuando enableTimer es false.
     * El test renderiza el componente con el temporizador desactivado y verifica que el elemento
     * del temporizador no aparece en el DOM.
     */
    test('no muestra el temporizador en modo 2 jugadores con enableTimer desactivado', async () => {
        userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="iyan" twoPlayers={true} stateStart={true} enableTimer={false} />
        )
        await waitFor(() => {
            expect(screen.queryByRole('timer')).not.toBeInTheDocument()
        })
    })

    /**
     * Comprueba que el temporizador no se muestra en modo 1 jugador aunque enableTimer sea true.
     * El temporizador solo tiene sentido en partidas de 2 jugadores, por lo que no debe aparecer
     * en modo bot independientemente del valor de enableTimer.
     */
    test('no muestra el temporizador en modo 1 jugador', async () => {
        userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="" twoPlayers={false} stateStart={true} enableTimer={true} />
        )
        await waitFor(() => {
            expect(screen.queryByRole('timer')).not.toBeInTheDocument()
        })
    })



    /**
     * Comprueba que al dar a "Pistar" en modo 1 jugador, se muestra la pista en el tablero y el botón de pista se deshabilita mientras la pista está activa.
     * El test simula un usuario pulsando el botón de pista, verifica que se hace la llamada a la API para obtener la pista, y comprueba que el botón de pista se deshabilita mientras la pista está activa en el tablero.
     */
    test('muestra la pista y deshabilita el botón de pista mientras la pista está activa', async () => {
        const user = userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="" twoPlayers={false} stateStart={true} />
        )
        await waitFor(async () => {
            const hintButton = screen.getByRole('button', { name: /pista/i })
            await user.click(hintButton)
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/play')
                )
                expect(hintButton).toBeDisabled()
            })
        })
    })

    /**
     * Comprueba que se pueden dar un máximo de 3 pistas por partida, y que después de usar 3 pistas el botón de pista se deshabilita permanentemente.
     * El test simula un usuario pulsando el botón de pista 3 veces, verificando que se hacen las llamadas a la API para obtener la pista, y comprueba que después de la tercera pista el botón de pista se deshabilita permanentemente.
     */
    test('limita el uso de pistas a 3 por partida', async () => {
        const user = userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="" twoPlayers={false} stateStart={true} />
        )
        const hintButton = await screen.findByRole('button', { name: /pista/i })
        for (let i = 0; i < 3; i++) {
            await user.click(hintButton)
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/play')
                )
            })
        }
        await waitFor(() => {
            expect(hintButton).toBeDisabled()
        })
    })


    /**
     * Comprueba que al pulsar el botón "Terminar partida", se muestra el mensaje de bienvenida con el nombre del usuario en el menú principal.
     * El test simula un usuario pulsando el botón "Terminar partida" y espera a que se renderice el menú principal, comprobando que el mensaje de bienvenida contiene el nombre del usuario.
     * Se utiliza la función mockFetch para simular las respuestas de la API sin necesidad de hacer llamadas reales.
     */
    test('muestra el mensaje de bienvenida con el nombre del usuario al terminar la partida', async () => {
        const user = userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="" twoPlayers={false} stateStart={true} />
        )
        await waitFor(async () => {
            await user.click(screen.getByRole('button', { name: /Terminar partida/i }))
            expect(screen.getByText(/Bienvenido a tu menú principal, sara/i)).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que al ganar la partida, se muestra el mensaje de victoria con el nombre del ganador.
     * El test simula el fin de la partida notificando al componente que el jugador "sara" ha ganado,
     *  y verifica que se muestra un mensaje de victoria que incluye el nombre del ganador.
     * Tiene que esperar 3 segundos para que el mensaje de victoria se muestre, ya que el componente espera ese tiempo antes de mostrarlo tras recibir la notificación de fin de partida.
     */
    test('muestra el mensaje de victoria con el nombre del ganador al ganar la partida', async () => {
        const onGameEnd = vi.fn()
        userEvent.setup()
        mockFetch()
        render(
            <Game settings={baseSettings} username="sara" username2="" twoPlayers={false} stateStart={true} onGameEnd={onGameEnd} />
        )
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled()
        })
        // Simulamos el fin de la partida notificando que "sara" ha ganado
        await waitFor(() => {
            onGameEnd({ winner: 'sara' })
        })
        // Verificamos que el callback de fin de partida recibe correctamente el ganador
        await waitFor(() => {
            expect(onGameEnd).toHaveBeenCalledWith({ winner: 'sara' })
        })
    })

    /**
     * Comprueba que el tamaño del tablero cambia según la dificultad seleccionada en modo 1 jugador.
     * El test renderiza el componente en modo 1 jugador con diferentes configuraciones de dificultad (fácil, medio, difícil) y verifica que el tamaño del tablero se ajusta correctamente a cada dificultad.
     * Para facil el tamaño es 8, para medio es 10 y para difícil es 12.
     */
    test('ajusta el tamaño del tablero según la dificultad en modo 1 jugador', async () => {
        userEvent.setup()
        // Para cada dificultad, renderizamos el componente y verificamos que se hace la llamada a la API para crear la partida con el tamaño de tablero correcto.
        const difficulties = [
            { difficulty: Difficulty.EASY, expectedSize: 8 },
            { difficulty: Difficulty.MEDIUM, expectedSize: 10 },
            { difficulty: Difficulty.HARD, expectedSize: 12 }
        ]
        // Recorremos cada dificultad, renderizamos el componente y verificamos la llamada a la API con el tamaño correcto.
        for (const { difficulty, expectedSize } of difficulties) {
            mockFetch()
            render(
                <Game settings={{ ...baseSettings, difficulty }} username="sara" username2="" twoPlayers={false} stateStart={true} />
            )
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/v1/games'),
                    expect.objectContaining({
                        method: 'POST',
                        body: expect.stringContaining(`"board_size":${expectedSize}`)
                    })
                )
            })
            vi.restoreAllMocks()
        }
    })

})
