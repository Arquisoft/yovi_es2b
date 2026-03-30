import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../users-service.js'
const { connectDB, getDB } = require('../src/database/db')
const UserService = require('../src/user-service')
const UserController = require('../src/user-controller')

/**
 * Creación correcta del usuario
 */
describe('POST /createuser', () => {
    beforeAll(async () => {
        await connectDB()
        const db = getDB()
        const userService = new UserService(db)
        const userController = new UserController(userService)
        
        app.post('/createuser', userController.createUser)
        app.post('/deleteuser', userController.deleteUser)
    });

    it('abre la página principal', async () => {
        const res = await request(app)
        .post('/createuser')
        .send({
            username: 'Test_Username',
            password: 'Test_Password1'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch(/Se creó el usuario Test_Username/i)

        // eliminamos el usuario
        await request(app).post('/deleteuser').send({username : 'Test_Username'})
    })
})