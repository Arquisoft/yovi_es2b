import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../users-service.js'
const { connectDB, getDB } = require('../src/database/db.js')
import { setup, takedown } from './users-service-fortest.js'
const UserService = require('../src/user-service.js')
const UserController = require('../src/user-controller.js')

/**
 * INICIA PARTIDA
 */
describe('POST /initmatch', () => {
    beforeAll(async () => {
        await connectDB()
        const db = getDB()
        const userService = new UserService(db)
        const userController = new UserController(userService)

        app.post('/initmatch', userController.initmatch)

    });

   /**
    * inicio de partida correcta
    */
    it('se inicia una partida', async () => {

        await setup('Test_Username_Play', 'Test_Password1')

        const res = await request(app)
        .post('/initmatch')
        .send({
            username: 'Test_Username_Play',
            strategy: 'RANDOM',
            difficulty: 'EASY'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(202)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch("Usuario Test_Username_Play ha iniciado una partida: estrategia RANDOM, dificultad EASY.")

        await takedown('Test_Username_Play')
    })

   /**
    * inicio de partida incorrecta
    * usuario no existe
    */
    it('no se inicia una partida por usuario inexistente', async () => {
        const res = await request(app)
        .post('/initmatch')
        .send({
            username: 'Test_Username_NoExiste',
            strategy: 'RANDOM',
            difficulty: 'EASY'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch("El usuario 'Test_Username_NoExiste' no existe. Prueba de nuevo o regístrate.")
    })

   /**
    * inicio de partida incorrecta
    * estrategia no existe
    */
    it('no se inicia una partida por estrategia inexistente', async () => {
        await setup('Test_Username_Play_Strat', 'Test_Password1')
        const res = await request(app)
        .post('/initmatch')
        .send({
            username: 'Test_Username_Play_Strat',
            strategy: 'Estrategia_Inexistente',
            difficulty: 'EASY'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(406)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch("La estrategia 'Estrategia_Inexistente' no es válida.")

        await takedown('Test_Username_Play_Strat')
    })
   
    /**
    * inicio de partida incorrecta
    * dificultad no existe
    */
    it('no se inicia una partida por dificultad inexistente', async () => {

        await setup('Test_Username_Play_Diff', 'Test_Password1')

        const res = await request(app)
        .post('/initmatch')
        .send({
            username: 'Test_Username_Play_Diff',
            strategy: 'RANDOM',
            difficulty: 'Dificultad_Inexistente'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(405)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch("La dificultad 'Dificultad_Inexistente' no es válida.")

        await takedown('Test_Username_Play_Diff')
    })
})