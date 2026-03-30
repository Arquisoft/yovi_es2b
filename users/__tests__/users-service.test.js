import { describe, it, expect } from 'vitest'

/**
 * Creación correcta del usuario
 */
describe('POST /createuser', () => {
    it('abre la página principal', async () => {
        const res = await request(app)
        .post('/createuser')
        .send({username : 'Test_Username'},
              {password : 'Test_Password1'})
        .set('Accept', 'application/json')

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('message')
        expect(res.body.message).toMatch(/Se creó el usuario Test_Username/i)

        // eliminamos el usuario
        await request(app).post('/deleteuser').send({username : 'Test_Username'})
    })
})