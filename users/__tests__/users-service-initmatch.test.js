import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../users-service.js'
const { connectDB, getDB } = require('../src/database/db.js')
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
        
        app.post('/createuser', userController.createUser)
        app.post('/deleteuser', userController.deleteuser)

        app.post('/initmatch', userController.initmatch)

        //Siempre crear un usuario
        await request(app)
        .post('/createuser')
        .send({
            username: 'Test_Username',
            password: 'Test_Password1'
        })
        .set('Accept', 'application/json')
    });

    afterAll(async () => {
        // Siempre eliminar el usuario
        await request(app).post('/deleteuser')
        .send({username : 'Test_Username'})
        .set('Accept', 'application/json')
    });

   /**
    * inicio de partida correcta
    */
    it('se inicia una partida', async () => {
        const res = await request(app)
        .post('/initmatch')
        .send({
            username: 'Test_Username',
            strategy: 'RANDOM',
            difficulty: 'EASY'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(202)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch("Usuario Test_Username ha iniciado una partida: estrategia RANDOM, dificultad EASY.")
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
        const res = await request(app)
        .post('/initmatch')
        .send({
            username: 'Test_Username',
            strategy: 'Estrategia_Inexistente',
            difficulty: 'EASY'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(406)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch("La estrategia 'Estrategia_Inexistente' no es válida.")
    })
   
    /**
    * inicio de partida incorrecta
    * dificultad no existe
    */
    it('no se inicia una partida por dificultad inexistente', async () => {
        const res = await request(app)
        .post('/initmatch')
        .send({
            username: 'Test_Username',
            strategy: 'RANDOM',
            difficulty: 'Dificultad_Inexistente'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(405)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch("La dificultad 'Dificultad_Inexistente' no es válida.")
    })
})