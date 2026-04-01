import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../users-service.js'
const { connectDB, getDB } = require('../src/database/db.js')
const UserService = require('../src/user-service.js')
const UserController = require('../src/user-controller.js')

/**
 * COMPRUEBA LA FUNCIONALIDAD DE LA BASE DE DATOS
 * EN LAS ESTADÍSTICAS DE LAS PARTIDAS
 */
describe('POST /allstats', () => {
    beforeAll(async () => {
        await connectDB()
        const db = getDB()
        const userService = new UserService(db)
        const userController = new UserController(userService)
        
        app.post('/createuser', userController.createUser)
        app.post('/deleteuser', userController.deleteuser)

        app.post('/allstats', userController.allstats)
        app.post('/diffstats', userController.diffstats)
        app.post('/stratstats', userController.stratstats)

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
    * saca todas las estadísticas bien
    */
    it('se obtienen todas las estadísticas', async () => {
        const res = await request(app)
        .post('/allstats')
        .send({
            username: 'Test_Username'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(202)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch("Se obtienen todas las estadísticas de Test_Username.")
    })

   /**
    * no saca todas las estadísticas bien
    * usuario inexistente
    */
    it('salta error de usuario inexistente con allstats', async () => {
        const res = await request(app)
        .post('/allstats')
        .send({
            username: 'Test_Username_Inexistente'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(410)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch("El usuario 'Test_Username_Inexistente' no existe. Prueba de nuevo o regístrate.")
    })

   /**
    * saca todas las estadísticas bien, por estrategia
    */
    it('se obtienen todas las estadísticas por estrategia', async () => {
        const res = await request(app)
        .post('/stratstats')
        .send({
            username: 'Test_Username'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(202)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch("Se obtienen todas las estadísticas de Test_Username por estrategia.")
    })

   /**
    * no saca todas las estadísticas bien
    * usuario inexistente
    */
    it('salta error de usuario inexistente con stratstats', async () => {
        const res = await request(app)
        .post('/stratstats')
        .send({
            username: 'Test_Username_Inexistente'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(410)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch("El usuario 'Test_Username_Inexistente' no existe. Prueba de nuevo o regístrate.")
    })
   
   /**
    * saca todas las estadísticas bien, por dificultad
    */
    it('se obtienen todas las estadísticas por dificultad', async () => {
        const res = await request(app)
        .post('/diffstats')
        .send({
            username: 'Test_Username'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(202)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch("Se obtienen todas las estadísticas de Test_Username por dificultad.")
    })

   /**
    * no saca todas las estadísticas bien
    * usuario inexistente
    */
    it('salta error de usuario inexistente con diffstats', async () => {
        const res = await request(app)
        .post('/diffstats')
        .send({
            username: 'Test_Username_Inexistente'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(410)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch("El usuario 'Test_Username_Inexistente' no existe. Prueba de nuevo o regístrate.")
    })

})