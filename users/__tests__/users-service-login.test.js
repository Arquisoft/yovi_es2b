import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../users-service.js'
const { connectDB, getDB } = require('../src/database/db.js')
const UserService = require('../src/user-service.js')
const UserController = require('../src/user-controller.js')

/**
 * LOGIN USUARIO
 */
describe('POST /loginuser', () => {
    beforeAll(async () => {
        await connectDB()
        const db = getDB()
        const userService = new UserService(db)
        const userController = new UserController(userService)
        
        app.post('/createuser', userController.createUser)
        app.post('/loginuser', userController.loginUser)
        app.post('/deleteuser', userController.deleteuser)

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
    * login correcto del usuario
    */
    it('abre la página principal con el usuario creado', async () => {
        const res = await request(app)
        .post('/loginuser')
        .send({
            username: 'Test_Username',
            password: 'Test_Password1'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch(/Se creó el usuario Test_Username/i)
    })

})