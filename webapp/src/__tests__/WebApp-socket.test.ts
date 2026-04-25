import { vi, describe, test, expect, beforeEach } from 'vitest'

// Instancia de socket simulada compartida entre tests
const mockDisconnect = vi.fn()
const mockSocketInstance = { disconnect: mockDisconnect } as any

// Reemplazamos socket.io-client para no abrir conexiones reales
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocketInstance),
}))

describe('socket', () => {
  // Reiniciamos mocks y caché de módulos antes de cada test para que la
  // variable de módulo `socket` empiece siendo null
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  test('getSocket crea el socket la primera vez', async () => {
    const { io } = await import('socket.io-client')
    const { getSocket } = await import('../socket')
    const s = getSocket()
    expect(io).toHaveBeenCalledOnce()
    expect(s).toBe(mockSocketInstance)
  })

  test('getSocket devuelve la misma instancia en llamadas sucesivas', async () => {
    const { io } = await import('socket.io-client')
    const { getSocket } = await import('../socket')
    getSocket()
    getSocket()
    // io solo debe llamarse una vez aunque se llame getSocket varias veces
    expect(io).toHaveBeenCalledOnce()
  })

  test('disconnectSocket desconecta y limpia el socket', async () => {
    const { io } = await import('socket.io-client')
    const { getSocket, disconnectSocket } = await import('../socket')
    getSocket()
    disconnectSocket()
    expect(mockDisconnect).toHaveBeenCalledOnce()
    // Tras desconectar, el socket en caché es null y getSocket crea uno nuevo
    getSocket()
    expect(io).toHaveBeenCalledTimes(2)
  })

  test('disconnectSocket no hace nada si no hay socket activo', async () => {
    const { disconnectSocket } = await import('../socket')
    disconnectSocket()
    expect(mockDisconnect).not.toHaveBeenCalled()
  })
})
