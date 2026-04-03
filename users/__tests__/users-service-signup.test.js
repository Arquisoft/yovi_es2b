import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../users-service.js'
const { connectDB, getDB } = require('../src/database/db.js')
const UserService = require('../src/user-service.js')
const UserController = require('../src/user-controller.js')

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
    it('abre la página principal con un usuario correcto', async () => {
        const res = await request(app)
        .post('/createuser')
        .send({
            username: 'Test_Username_Correcto',
            password: 'Test_Password1'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch(/Se creó el usuario Test_Username_Correcto/i)

        // eliminamos el usuario
        const deleteRes = await request(app).post('/deleteuser')
        .send({username : 'Test_Username_Correcto'})
        .set('Accept', 'application/json')

        expect(deleteRes.status).toBe(201)
    })

   /**
    * Creación incorrecta del usuario
    * usuario repetido
    */
    it('salta error con usuario repetido', async () => {
        // primer usuario
        const res1 = await request(app)
        .post('/createuser')
        .send({
            username: 'Test_Username_Rep',
            password: 'Test_Password1'
        })
        .set('Accept', 'application/json')

        expect(res1.status).toBe(201)
        expect(res1.body).toHaveProperty('message')
        expect(res1.body.message).toMatch(/Se creó el usuario Test_Username/i)

        // usuario repetido
        const res2 = await request(app)
        .post('/createuser')
        .send({
            username: 'Test_Username_Rep',
            password: 'Test_Password1'
        })
        .set('Accept', 'application/json')

        expect(res2.status).toBe(409)
        expect(res2.body).toHaveProperty('error')
        expect(res2.body.error).toMatch("El usuario 'Test_Username_Rep' ya existe. Prueba con otro nombre de usuario.")

        // eliminamos el usuario
        const deleteRes = await request(app).post('/deleteuser')
        .send({username : 'Test_Username_Rep'})
        .set('Accept', 'application/json')

        expect(deleteRes.status).toBe(201)
    })

   /**
    * Creación incorrecta del usuario
    * usuario vacío o en blanco
    */
    it('salta error con usuario vacío y en blanco', async () => {
        // usuario vacio
        const res = await request(app)
        .post('/createuser')
        .send({
            username: '',
            password: 'Test_Password1'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(403)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch(/Faltan campos por rellenar./i)

        // usuario blanco
        const resb = await request(app)
        .post('/createuser')
        .send({
            username: '   ',
            password: 'Test_Password1'
        })
        .set('Accept', 'application/json')

        expect(resb.status).toBe(403)
        expect(resb.body).toHaveProperty('error')
        expect(resb.body.error).toMatch(/Faltan campos por rellenar./i)
    })

   /**
    * Creación incorrecta del usuario
    * contraseña vacía
    */
    it('salta error con contraseña vacía', async () => {
        // contraseña vacía
        const res = await request(app)
        .post('/createuser')
        .send({
            username: 'Test_Username',
            password: ''
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(403)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch(/Faltan campos por rellenar./i)
    })

   /**
    * Creación incorrecta del usuario
    * contraseña num caracteres < 5
    */
    it('salta error con contraseña corta', async () => {
        // contraseña corta
        const res = await request(app)
        .post('/createuser')
        .send({
            username: 'Test_Username_ShortPassw',
            password: '1234'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(402)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch(/La contraseña debe tener 5 o más caracteres./i)
    })

    /**
    * Creación incorrecta del usuario
    * contraseña sin minusculas
    */
    it('salta error con contraseña sin minusculas', async () => {
        // contraseña sin minusculas
        const res = await request(app)
        .post('/createuser')
        .send({
            username: 'Test_Username_NoMinus',
            password: 'SIN_MINUSCULAS'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(402)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch(/La contraseña debe contener al menos una minúscula./i)
    })

    /**
    * Creación incorrecta del usuario
    * contraseña sin mayusculas
    */
    it('salta error con contraseña sin mayusculas', async () => {
        // contraseña sin mayusculas
        const res = await request(app)
        .post('/createuser')
        .send({
            username: 'Test_Username_NoMayus',
            password: 'sin_mayusculas'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(402)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch(/La contraseña debe contener al menos una mayúscula./i)
    })

   /**
    * Creación incorrecta del usuario
    * contraseña sin numeros
    */
    it('salta error con contraseña sin numeros', async () => {
        // contraseña sin numeros
        const res = await request(app)
        .post('/createuser')
        .send({
            username: 'Test_Username_NoNum',
            password: 'Sin_Numeros'
        })
        .set('Accept', 'application/json')

        expect(res.status).toBe(402)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch(/La contraseña debe contener al menos un número./i)
    })
})