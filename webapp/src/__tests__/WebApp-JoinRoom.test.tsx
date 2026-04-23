import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import JoinRoom from '../screens/lobby/JoinRoom'

const eventHandlers: Record<string, (...args: any[]) => void> = {}

const mockSocket = {
  on: vi.fn((event: string, handler: (...args: any[]) => void) => {
    eventHandlers[event] = handler
  }),
  off: vi.fn(),
  emit: vi.fn(),
}

vi.mock('../socket', () => ({
  getSocket: vi.fn(() => mockSocket),
}))

const onGameReady = vi.fn()
const onBack = vi.fn()

describe('JoinRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(eventHandlers).forEach(k => delete eventHandlers[k])
  })

  test('muestra el input, botón Unirse y botón Volver', () => {
    render(<JoinRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    expect(screen.getByLabelText(/Código de sala/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Unirse/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Volver/i })).toBeInTheDocument()
  })

  test('Volver llama a onBack', async () => {
    const user = userEvent.setup()
    render(<JoinRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: /Volver/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  test('Unirse con input vacío muestra error', async () => {
    const user = userEvent.setup()
    render(<JoinRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: /Unirse/i }))
    expect(screen.getByText(/Introduce el código de la sala/i)).toBeInTheDocument()
    expect(mockSocket.emit).not.toHaveBeenCalled()
  })

  test('Unirse con código válido emite join-room en mayúsculas', async () => {
    const user = userEvent.setup()
    render(<JoinRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    await user.type(screen.getByLabelText(/Código de sala/i), 'abc123')
    await user.click(screen.getByRole('button', { name: /Unirse/i }))
    expect(mockSocket.emit).toHaveBeenCalledWith('join-room', { code: 'ABC123', username: 'sara' })
  })

  test('el input convierte el texto a mayúsculas', async () => {
    const user = userEvent.setup()
    render(<JoinRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    const input = screen.getByLabelText(/Código de sala/i)
    await user.type(input, 'abc')
    expect(input).toHaveValue('ABC')
  })

  test('escribir en el input limpia el error', async () => {
    const user = userEvent.setup()
    render(<JoinRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: /Unirse/i }))
    expect(screen.getByText(/Introduce el código de la sala/i)).toBeInTheDocument()
    await user.type(screen.getByLabelText(/Código de sala/i), 'A')
    expect(screen.queryByText(/Introduce el código de la sala/i)).not.toBeInTheDocument()
  })

  test('room-joined muestra mensaje de espera y oculta el formulario', () => {
    render(<JoinRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    act(() => {
      eventHandlers['room-joined']({
        code: 'ABC123',
        gameId: 'game-1',
        playerIndex: 1,
        difficulty: 'MEDIUM',
        opponentUsername: 'rival',
      })
    })
    expect(screen.getByText(/Conectado/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Unirse/i })).not.toBeInTheDocument()
  })

  test('game-start llama a onGameReady con la info correcta', () => {
    render(<JoinRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    act(() => {
      eventHandlers['room-joined']({
        code: 'ABC123',
        gameId: 'game-1',
        playerIndex: 1,
        difficulty: 'MEDIUM',
        opponentUsername: 'rival',
      })
    })
    act(() => {
      eventHandlers['game-start']({
        gameId: 'game-1',
        difficulty: 'MEDIUM',
        players: [
          { username: 'rival', playerIndex: 0 },
          { username: 'sara', playerIndex: 1 },
        ],
      })
    })
    expect(onGameReady).toHaveBeenCalledWith({
      gameId: 'game-1',
      code: 'ABC123',
      playerIndex: 1,
      opponentUsername: 'rival',
      difficulty: 'MEDIUM',
    })
  })

  test('room-error muestra el mensaje de error', () => {
    render(<JoinRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    act(() => {
      eventHandlers['room-error']({ message: 'Sala no encontrada' })
    })
    expect(screen.getByText('Sala no encontrada')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Unirse/i })).toBeInTheDocument()
  })

  test('los listeners del socket se limpian al desmontar', () => {
    const { unmount } = render(<JoinRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    unmount()
    expect(mockSocket.off).toHaveBeenCalledWith('room-joined')
    expect(mockSocket.off).toHaveBeenCalledWith('game-start')
    expect(mockSocket.off).toHaveBeenCalledWith('room-error')
  })
})
