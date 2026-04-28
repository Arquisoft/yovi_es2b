import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { End } from '../screens/game/End'
import { Difficulty } from '../components/gameOptions/Difficulty'
import { Strategy } from '../components/gameOptions/Strategy'
import { afterEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'
import type { ComponentProps } from 'react'
import { renderWithProviders } from './test-utils'

const baseProps = {
    winner: 'sara',
    username: 'sara',
    settings: { strategy: Strategy.RANDOM, difficulty: Difficulty.EASY },
    onGoHome: vi.fn(),
    onPlayAgain: vi.fn(),
}

type EndTestProps = ComponentProps<typeof End>

/**
 * Funcion para renderizar el componente End con los props necesarios, permitiendo sobreescribir algunos de ellos para cada test.
 * Se utiliza para evitar repetir el código de renderizado en cada test y facilitar la creación de tests con diferentes escenarios (victoria, derrota, modo 2 jugadores, etc).
 * Overrides permite pasar solo los props que se quieren modificar respecto a los valores por defecto definidos en baseProps, y el resto se mantiene igual para todos los tests.
 * Partial es un tipo de TypeScript que hace que todas las propiedades de EndTestProps sean opcionales, lo que permite pasar solo las que se quieran modificar en cada test.
 * 
 * @param overrides 
 * @returns 
 */
function renderEnd(overrides: Partial<EndTestProps> = {}) {
    const props: EndTestProps = Object.assign({}, baseProps, overrides)
    return renderWithProviders(
        <End
            winner={props.winner}
            username={props.username}
            username2={props.username2}
            twoPlayers={props.twoPlayers}
            settings={props.settings}
            onGoHome={props.onGoHome}
            onPlayAgain={props.onPlayAgain}
        />
    )
}

/**
 * Tests para el componente End, que se muestra al finalizar la partida. Comprueba que:
 * - Muestra el icono, título, subtítulo, resumen y botones correctos según el resultado (victoria o derrota) en modo 1 jugador
 * - Llama a las funciones onGoHome y onPlayAgain al pulsar los botones correspondientes
 * - No muestra información de estrategia ni resultado en modo 2 jugadores, y no muestra tamaño del tablero en modo 1 jugador
 */
describe('End - modo 1 jugador', () => {
    afterEach(() => {
        vi.restoreAllMocks() // restauramos los mocks después de cada test para evitar interferencias entre tests
    })

    /**
     * En modo 1 jugador, si el ganador es el usuario, se muestra el icono de trofeo, el título "¡Victoria!", un subtítulo de enhorabuena, un resumen con el nombre del jugador, la dificultad, la estrategia y el resultado "Victoria", y los botones "Jugar de nuevo" y "Volver al menú".
     */
    test('muestra el icono de trofeo al ganar', () => {
        renderEnd()
        expect(screen.getByText('🏆')).toBeInTheDocument()
        expect(screen.queryByText('💀')).not.toBeInTheDocument()
        expect(screen.getByText('¡Victoria!')).toBeInTheDocument()
        expect(screen.getByText(/Enhorabuena, sara, ganaste la partida/i)).toBeInTheDocument()
        expect(screen.getByText('Jugador')).toBeInTheDocument()
        expect(screen.getByText('sara')).toBeInTheDocument()
        expect(screen.getByText('Dificultad')).toBeInTheDocument()
        expect(screen.getByText('EASY')).toBeInTheDocument()
        expect(screen.getByText('Estrategia')).toBeInTheDocument()
        expect(screen.getByText('RANDOM')).toBeInTheDocument()
        expect(screen.getByText('Resultado')).toBeInTheDocument()
        expect(screen.getByText('Victoria')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Jugar de nuevo/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Volver al menú/i })).toBeInTheDocument()
    })

    /**
     * En modo 1 jugador, si el ganador es la máquina, se muestra el icono de calavera, el título "Derrota", un subtítulo de derrota, un resumen con el nombre del jugador, la dificultad, la estrategia y el resultado "Derrota", y los botones "Jugar de nuevo" y "Volver al menú".
     */
    test('muestra el icono de calavera al perder', () => {
        renderEnd({ winner: 'BOT' })
        expect(screen.getByText('💀')).toBeInTheDocument()
        expect(screen.queryByText('🏆')).not.toBeInTheDocument()
        expect(screen.getByText('¡Derrota!')).toBeInTheDocument()
        expect(screen.getByText(/Has perdido. ¡Intentalo de nuevo!/i)).toBeInTheDocument()
        expect(screen.getByText('Jugador')).toBeInTheDocument()
        expect(screen.getByText('sara')).toBeInTheDocument()
        expect(screen.getByText('Dificultad')).toBeInTheDocument()
        expect(screen.getByText('EASY')).toBeInTheDocument()
        expect(screen.getByText('Estrategia')).toBeInTheDocument()
        expect(screen.getByText('RANDOM')).toBeInTheDocument()
        expect(screen.getByText('Resultado')).toBeInTheDocument()
        expect(screen.getByText('Derrota')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Jugar de nuevo/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Volver al menú/i })).toBeInTheDocument()
    })


    /**
     * Comprueba que al pulsar el botón "Jugar de nuevo", se llama a la función onPlayAgain para iniciar una nueva partida con las mismas configuraciones.
      * El test simula un usuario pulsando el botón "Jugar de nuevo" y espera a que se llame a la función onPlayAgain, comprobando que se ha llamado exactamente una vez.
     */
   test('llama a onPlayAgain al pulsar Jugar de nuevo', async () => {
        const user = userEvent.setup()
        const onPlayAgain = vi.fn()
        renderEnd({ onPlayAgain })
        await user.click(screen.getByRole('button', { name: /Jugar de nuevo/i }))
        expect(onPlayAgain).toHaveBeenCalledOnce()
    })

    /**
     * Comprueba que al pulsar el botón "Volver al menú", se llama a la función onGoHome para volver al menú principal.
     * El test simula un usuario pulsando el botón "Volver al menú" y espera a que se llame a la función onGoHome, comprobando que se ha llamado exactamente una vez.
     */
    test('llama a onGoHome al pulsar Volver al menú', async () => {
        const user = userEvent.setup()
        const onGoHome = vi.fn()
        renderEnd({ onGoHome })
        await user.click(screen.getByRole('button', { name: /Volver al menú/i }))
        expect(onGoHome).toHaveBeenCalledOnce()
    })

    /**
     * Comprueba que no se muestra el tamaño del tablero en modo 1 jugador, ya que esta información solo es relevante en modo 2 jugadores. El componente no debe mostrar ningún texto relacionado con el tamaño del tablero en este modo.
     * El test renderiza el componente en modo 1 jugador y comprueba que no se encuentra ningún texto relacionado con el tamaño del tablero.
     */
    test('no muestra Tamaño del tablero en modo 1 jugador', () => {
        renderEnd()
        expect(screen.queryByText('Tamaño del tablero')).not.toBeInTheDocument()
    })
})


 describe('End - modo 2 jugadores', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    const twoPlayersProps = Object.assign({}, baseProps, {
        winner: 'iyan',
        username2: 'iyan',
        twoPlayers: true,
    })

    /**
     * En modo 2 jugadores, se muestra el icono de trofeo, el título "¡Ganó [nombre del ganador]!", un subtítulo de enhorabuena con el nombre del ganador, un resumen con el nombre del ganador, el perdedor y el tamaño del tablero, y los botones "Jugar de nuevo" y "Volver al menú". No se muestra información de estrategia ni resultado, ya que en modo 2 jugadores no hay una máquina o dificultad involucrada.
     */
    test('muestra el icono de trofeo en modo 2 jugadores', () => {
        renderEnd(twoPlayersProps)
        expect(screen.getByText('🏆')).toBeInTheDocument()
        expect(screen.queryByText('💀')).not.toBeInTheDocument()
        expect(screen.getByText('¡Ganó iyan!')).toBeInTheDocument()
        expect(screen.getByText(/Enhorabuena, iyan, ganaste la partida/i)).toBeInTheDocument()
        expect(screen.getByText('Ganador')).toBeInTheDocument()
        expect(screen.getByText('iyan')).toBeInTheDocument()
        expect(screen.getByText('Perdedor')).toBeInTheDocument()
        expect(screen.getByText('sara')).toBeInTheDocument()
        expect(screen.getByText('Tamaño del tablero')).toBeInTheDocument()
        expect(screen.getByText('Pequeño')).toBeInTheDocument()

        expect(screen.queryByText('Estrategia')).not.toBeInTheDocument()
        expect(screen.queryByText('Resultado')).not.toBeInTheDocument()

        expect(screen.getByRole('button', { name: /Jugar de nuevo/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Volver al menú/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que al pulsar el botón "Jugar de nuevo", se llama a la función onPlayAgain para iniciar una nueva partida con las mismas configuraciones.
     */
    test('llama a onPlayAgain al pulsar Jugar de nuevo en modo 2 jugadores', async () => {
        const user = userEvent.setup()
        const onPlayAgain = vi.fn()
        renderEnd(Object.assign({}, twoPlayersProps, { onPlayAgain }))
        await user.click(screen.getByRole('button', { name: /Jugar de nuevo/i }))
        expect(onPlayAgain).toHaveBeenCalledOnce()
    })

    /**
     * Comprueba que al pulsar el botón "Volver al menú", se llama a la función onGoHome para volver al menú principal.
     */
    test('llama a onGoHome al pulsar Volver al menú en modo 2 jugadores', async () => {
        const user = userEvent.setup()
        const onGoHome = vi.fn()
        renderEnd(Object.assign({}, twoPlayersProps, { onGoHome }))
        await user.click(screen.getByRole('button', { name: /Volver al menú/i }))
        expect(onGoHome).toHaveBeenCalledOnce()
    }) 
})  