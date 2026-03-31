import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../users-service.js'
const { connectDB, getDB } = require('../src/database/db')
const UserService = require('../src/user-service')
const UserController = require('../src/user-controller')

/**
 * CREACION USUARIO
 */
describe('POST /createuser', () => {
    beforeAll(async () => {
        await connectDB()
        const db = getDB()
        const userService = new UserService(db)
        const userController = new UserController(userService)
        
        app.post('/createuser', userController.createUser)
        app.post('/deleteuser', userController.deleteuser)
    });

   /**
    * Creación correcta del usuario
    */
    it('abre la página principal', async () => {
        const res = await request(app)
        .post('/createuser')
        .send({
            username: 'Test_Username',
            password: 'Test_Password1'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch(/Se creó el usuario Test_Username/i)

        // eliminamos el usuario
        const deleteRes = await request(app).post('/deleteuser')
        .send({username : 'Test_Username'})
        .set('Accept', 'application/json')

        expect(deleteRes.status).toBe(201)
    })
})