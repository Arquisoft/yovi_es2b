import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import CreateRoom from '../screens/lobby/CreateRoom'
import { es } from '../i18n/es'
import { renderWithProviders } from './test-utils'

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

describe('CreateRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(eventHandlers).forEach(k => delete eventHandlers[k])
  })

  test('muestra los botones de dificultad, Crear sala y Volver', () => {
    renderWithProviders(<CreateRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    expect(screen.getByText(es.rooms.small)).toBeInTheDocument()
    expect(screen.getByText(es.rooms.medium)).toBeInTheDocument()
    expect(screen.getByText(es.rooms.large)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Crear sala/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Volver/i })).toBeInTheDocument()
  })

  test('Volver llama a onBack', async () => {
    const user = userEvent.setup()
    render(<CreateRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: /Volver/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  test('Crear sala emite create-room con la dificultad por defecto (MEDIUM)', async () => {
    const user = userEvent.setup()
    render(<CreateRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: /Crear sala/i }))
    expect(mockSocket.emit).toHaveBeenCalledWith('create-room', { username: 'sara', difficulty: 'MEDIUM', timerEnabled: true })
  })

  test('seleccionar Pequeño cambia la dificultad a EASY', async () => {
    const user = userEvent.setup()
    render(<CreateRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: /Pequeño/i }))
    await user.click(screen.getByRole('button', { name: /Crear sala/i }))
    expect(mockSocket.emit).toHaveBeenCalledWith('create-room', { username: 'sara', difficulty: 'EASY', timerEnabled: true })
  })

  test('seleccionar Grande cambia la dificultad a HARD', async () => {
    const user = userEvent.setup()
    render(<CreateRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: /Grande/i }))
    await user.click(screen.getByRole('button', { name: /Crear sala/i }))
    expect(mockSocket.emit).toHaveBeenCalledWith('create-room', { username: 'sara', difficulty: 'HARD', timerEnabled: true })
  })

  test('room-created muestra el código y el mensaje de espera', () => {
    render(<CreateRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    act(() => {
      eventHandlers['room-created']({ code: 'ABC123', gameId: 'game-1', playerIndex: 0 })
    })
    expect(screen.getByText('ABC123')).toBeInTheDocument()
    expect(screen.getByText(/Esperando/i)).toBeInTheDocument()
  })

  test('room-created oculta el selector de dificultad', () => {
    render(<CreateRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    act(() => {
      eventHandlers['room-created']({ code: 'ABC123', gameId: 'game-1', playerIndex: 0 })
    })
    expect(screen.queryByRole('button', { name: /Crear sala/i })).not.toBeInTheDocument()
  })

  test('game-start llama a onGameReady con la info correcta', () => {
    render(<CreateRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    act(() => {
      eventHandlers['room-created']({ code: 'ABC123', gameId: 'game-1', playerIndex: 0 })
    })
    act(() => {
      eventHandlers['game-start']({
        gameId: 'game-1',
        difficulty: 'MEDIUM',
        timerEnabled: true,
        players: [
          { username: 'sara', playerIndex: 0 },
          { username: 'rival', playerIndex: 1 },
        ],
      })
    })
    expect(onGameReady).toHaveBeenCalledWith({
      gameId: 'game-1',
      code: 'ABC123',
      playerIndex: 0,
      opponentUsername: 'rival',
      difficulty: 'MEDIUM',
      timerEnabled: true,
    })
  })

  test('room-error muestra el mensaje de error y oculta la espera', () => {
    render(<CreateRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    act(() => {
      eventHandlers['room-error']({ message: 'La sala ya existe' })
    })
    expect(screen.getByText('La sala ya existe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Crear sala/i })).toBeInTheDocument()
  })

  test('game-start no llama a onGameReady si no hay oponente en la lista de jugadores', () => {
    render(<CreateRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    // Primero simulamos room-created para que codeRef.current tenga valor
    act(() => {
      eventHandlers['room-created']({ code: 'ABC123', gameId: 'game-1', playerIndex: 0 })
    })
    // game-start con solo el jugador local (sin playerIndex === 1) → debe ignorarse
    act(() => {
      eventHandlers['game-start']({
        gameId: 'game-1',
        difficulty: 'MEDIUM',
        players: [{ username: 'sara', playerIndex: 0 }],
      })
    })
    expect(onGameReady).not.toHaveBeenCalled()
  })

  test('los listeners del socket se limpian al desmontar', () => {
    const { unmount } = render(<CreateRoom username="sara" onGameReady={onGameReady} onBack={onBack} />)
    unmount()
    expect(mockSocket.off).toHaveBeenCalledWith('room-created')
    expect(mockSocket.off).toHaveBeenCalledWith('game-start')
    expect(mockSocket.off).toHaveBeenCalledWith('room-error')
  })
})
