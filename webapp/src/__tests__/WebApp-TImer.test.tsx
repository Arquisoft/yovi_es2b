import { render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'
import TurnTimer from '../components/timer/Timer'

// Forzar idioma español para los tests
beforeEach(() => {
    localStorage.setItem('yovi-locale', 'es')
})

describe('TurnTimer', () => {
    beforeEach(() => {
        vi.useFakeTimers() // controlamos el tiempo manualmente en cada test
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    /**
     * Comprueba que el temporizador se renderiza con 15 segundos al montarse,
     * tiene role="timer" y el aria-label correcto para accesibilidad.
     */
    test('se renderiza con 15 segundos iniciales', () => {
        render(<TurnTimer turno="sara" onExpire={vi.fn()} />)

        const timer = screen.getByRole('timer')
        expect(timer).toBeInTheDocument()
        expect(timer).toHaveTextContent('15s')
        expect(timer).toHaveAttribute('aria-label', expect.stringContaining('segundos'))
    })

    /**
     * Comprueba que el temporizador decrementa cada segundo.
     */
    test('decrementa el tiempo cada segundo', () => {
        render(<TurnTimer turno="sara" onExpire={vi.fn()} />)

        act(() => { vi.advanceTimersByTime(1000) })
        expect(screen.getByRole('timer')).toHaveTextContent('14s')

        act(() => { vi.advanceTimersByTime(3000) })
        expect(screen.getByRole('timer')).toHaveTextContent('11s')
    })

    /**
     * Comprueba que se llama a onExpire exactamente una vez cuando el tiempo llega a 0.
     */
    test('llama a onExpire cuando el tiempo llega a 0', () => {
        const onExpire = vi.fn()
        render(<TurnTimer turno="sara" onExpire={onExpire} />)

        act(() => { vi.advanceTimersByTime(15000) })

        expect(onExpire).toHaveBeenCalledTimes(1)
    })

    /**
     * Comprueba que onExpire NO se llama antes de que el tiempo llegue a 0.
     */
    test('no llama a onExpire antes de que el tiempo llegue a 0', () => {
        const onExpire = vi.fn()
        render(<TurnTimer turno="sara" onExpire={onExpire} />)

        act(() => { vi.advanceTimersByTime(14000) })

        expect(onExpire).not.toHaveBeenCalled()
    })

    /**
     * Comprueba que al cambiar el turno el temporizador se reinicia a 15 segundos,
     * cancelando el intervalo anterior.
     */
    test('se reinicia a 15 segundos al cambiar el turno', () => {
        const { rerender } = render(<TurnTimer turno="sara" onExpire={vi.fn()} />)

        act(() => { vi.advanceTimersByTime(8000) }) // avanzamos 8 segundos
        expect(screen.getByRole('timer')).toHaveTextContent('7s')

        rerender(<TurnTimer turno="iyan" onExpire={vi.fn()} />) // cambia el turno

        expect(screen.getByRole('timer')).toHaveTextContent('15s')
    })

    /**
     * Comprueba que al cambiar el turno no se llama a onExpire aunque el temporizador
     * anterior estuviera cerca de 0, ya que el intervalo previo se cancela.
     */
    test('no llama a onExpire del turno anterior al cambiar turno', () => {
        const onExpire = vi.fn()
        const { rerender } = render(<TurnTimer turno="sara" onExpire={onExpire} />)

        act(() => { vi.advanceTimersByTime(14000) }) // casi a 0
        rerender(<TurnTimer turno="iyan" onExpire={onExpire} />) // cambia el turno antes de expirar
        act(() => { vi.advanceTimersByTime(1000) }) // el segundo que habría expirado el anterior

        expect(onExpire).not.toHaveBeenCalled() // el intervalo anterior fue cancelado
    })

    /**
     * Comprueba que el temporizador aplica la clase CSS "turn-timer--warning"
     * cuando quedan 5 segundos o menos (pero más de 3).
     */
    test('aplica clase warning cuando quedan 5 segundos o menos', () => {
        render(<TurnTimer turno="sara" onExpire={vi.fn()} />)

        act(() => { vi.advanceTimersByTime(10000) }) // quedan 5s

        expect(screen.getByRole('timer')).toHaveClass('turn-timer--warning')
        expect(screen.getByRole('timer')).not.toHaveClass('turn-timer--critical')
    })

    /**
     * Comprueba que el temporizador aplica la clase CSS "turn-timer--critical"
     * cuando quedan 3 segundos o menos.
     */
    test('aplica clase critical cuando quedan 3 segundos o menos', () => {
        render(<TurnTimer turno="sara" onExpire={vi.fn()} />)

        act(() => { vi.advanceTimersByTime(12000) }) // quedan 3s

        expect(screen.getByRole('timer')).toHaveClass('turn-timer--critical')
        expect(screen.getByRole('timer')).not.toHaveClass('turn-timer--warning')
    })

    /**
     * Comprueba que sin haber avanzado el tiempo no se aplica ninguna clase de alerta.
     */
    test('no aplica clases de alerta con tiempo suficiente', () => {
        render(<TurnTimer turno="sara" onExpire={vi.fn()} />)

        const timer = screen.getByRole('timer')
        expect(timer).not.toHaveClass('turn-timer--warning')
        expect(timer).not.toHaveClass('turn-timer--critical')
    })
})
