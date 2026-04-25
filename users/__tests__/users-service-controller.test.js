import { describe, it, expect, vi } from 'vitest'

const UserController = require('../src/user-controller.js')
const UserError = require('../src/errors/UserError.js')

function createMockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('UserController', () => {
  it('loginUser devuelve 200 y mensaje cuando el servicio responde correctamente', async () => {
    const userService = {
      loginUser: vi.fn().mockResolvedValue('Sesion iniciada con sara.')// Mock del servicio que simula una respuesta exitosa
    }
    const controller = new UserController(userService)
    const req = { body: { username: 'sara', password: 'Sara1234' } }
    const res = createMockRes()

    await controller.loginUser(req, res)

    expect(userService.loginUser).toHaveBeenCalledWith('sara', 'Sara1234')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ message: 'Sesion iniciada con sara.' })
  })

  it('loginUser devuelve error de negocio con su codigo', async () => {
    const userService = {
      loginUser: vi.fn().mockRejectedValue(new UserError('Credenciales invalidas', 401))
      // Mock del servicio que simula una respuesta de error de negocio por usar credenciales incorrectas
    }
    const controller = new UserController(userService)
    const req = { body: { username: 'sara', password: 'incorrecta' } }
    const res = createMockRes()

    await controller.loginUser(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales invalidas' })
  })

  it('createUser devuelve 201 cuando se crea un usuario', async () => {
    const userService = {
      createUser: vi.fn().mockResolvedValue('Se creo el usuario usarioTestController.')
      // Mock del servicio que simula una respuesta exitosa al crear un usuario
    }
    const controller = new UserController(userService)
    const req = { body: { username: 'usuarioTestController', password: 'Test123' } }
    const res = createMockRes()

    await controller.createUser(req, res)

    expect(userService.createUser).toHaveBeenCalledWith('usuarioTestController', 'Test123')
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('getUser devuelve 200 con el usuario solicitado', async () => {
    const user = { username: 'sara', createdAt: new Date() }
    const userService = {
      getUser: vi.fn().mockResolvedValue(user)
    }
    const controller = new UserController(userService)
    const req = { params: { id: 'sara' } }
    const res = createMockRes()

    await controller.getUser(req, res)

    expect(userService.getUser).toHaveBeenCalledWith('sara')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(user)
  })
})
