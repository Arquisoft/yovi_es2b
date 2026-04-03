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
        expect(res.body.message).toMatch("Sesión iniciada con Test_Username.")
    })

   /**
    * login incorrecto del usuario
    * usuario vacío
    */
    it('salta error por usuario vacio', async () => {
        const res = await request(app)
        .post('/loginuser')
        .send({
            username: '',
            password: 'Test_Password1'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(403)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch(/Faltan campos por rellenar/i)
    })

   /**
    * login incorrecto del usuario
    * contraseña vacía
    */
    it('salta error por contraseña vacia', async () => {
        const res = await request(app)
        .post('/loginuser')
        .send({
            username: 'Test_Username',
            password: ''
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(403)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch(/Faltan campos por rellenar/i)
    })

    /**
    * login incorrecto del usuario
    * contraseña vacía
    */
    it('salta error por contraseña vacia', async () => {
        const res = await request(app)
        .post('/loginuser')
        .send({
            username: 'Test_Username',
            password: ''
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(403)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch(/Faltan campos por rellenar/i)
    })

   /**
    * login incorrecto del usuario
    * usuario no existe
    */
    it('salta error por usuario no existe', async () => {
        const res = await request(app)
        .post('/loginuser')
        .send({
            username: 'Test_Username_No_Existe',
            password: 'Test_Password1'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch("El usuario 'Test_Username_No_Existe' no existe. Prueba de nuevo o regístrate.")
    })

   /**
    * login incorrecto del usuario
    * contraseña incorrecta
    */
    it('salta error por contraseña incorrecta', async () => {
        const res = await request(app)
        .post('/loginuser')
        .send({
            username: 'Test_Username',
            password: 'Test_Password_Incorrecta'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(401)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch("Usuario o contraseña incorrectos. Inténtalo de nuevo.")
    })

})