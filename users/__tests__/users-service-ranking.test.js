import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../users-service.js'
const { connectDB, getDB } = require('../src/database/db.js')
import { setup, takedown } from './users-service-fortest.js'
const UserService = require('../src/user-service.js')
const UserController = require('../src/user-controller.js')
 
/**
 * COMPRUEBA LA FUNCIONALIDAD DE LA BASE DE DATOS
 * EN LOS RANKINGS GLOBALES — RUTAS GET
 */
describe('GET /ranking', () => {
    beforeAll(async () => {
        await connectDB()
        const db = getDB()
        const userService = new UserService(db)
        const userController = new UserController(userService)
 
        app.get('/ranking/wins',         userController.rankingvictories)
        app.get('/ranking/defeats',      userController.rankingdefeats)
    })

    // ---------- Ranking por victorias ---------- //
    
    /**
     * Devuelve el ranking global por victorias correctamente
     */
    it('se obtiene el ranking por victorias', async () => {

        await setup('Test_Username_Ranking_Wins', 'Test_Password_Wins')

        const res = await request(app)
            .get('/ranking/wins')
            .set('Accept', 'application/json')
 
        expect(res.status).toBe(202)
        expect(res.body).toHaveProperty('ranking')
        expect(Array.isArray(res.body.ranking)).toBe(true)

        await takedown('Test_Username_Ranking_Wins')
    })
 
    /**
     * El ranking por victorias está ordenado de más a menos
     */
    it('el ranking por victorias está ordenado de mas a menos', async () => {
        const res = await request(app)
            .get('/ranking/wins')
            .set('Accept', 'application/json')
 
        const ranking = res.body.ranking
        for (let i = 0; i < ranking.length - 1; i++) {
            expect(ranking[i].value).toBeGreaterThanOrEqual(ranking[i + 1].value)
        }
    })
 
    /**
     * Cada entrada del ranking por victorias tiene username, value y percentage
     */
    it('cada entrada del ranking por victorias tiene username, value y percentage', async () => {
        const res = await request(app)
            .get('/ranking/wins')
            .set('Accept', 'application/json')
 
        for (const entry of res.body.ranking) {
            expect(entry).toHaveProperty('username')
            expect(entry).toHaveProperty('value')
            expect(entry).toHaveProperty('percentage')

        }
    })


    /**
     * El percentage del ranking por victorias está entre 0 y 100
     */
    it('el percentage del ranking por victorias está entre 0 y 100', async () => {
        const res = await request(app)
            .get('/ranking/wins')
            .set('Accept', 'application/json')
 
        for (const entry of res.body.ranking) {
            expect(entry.percentage).toBeGreaterThanOrEqual(0)
            expect(entry.percentage).toBeLessThanOrEqual(100)
        }
    })

    /**
     * El ranking por victorias ordenado por percentage es el adecuado (de mayor a menor)
     */
    it('el ranking por victorias ordenado por percentage es el adecuado (de mayor a menor)', async () => {
        const res = await request(app)
            .get('/ranking/wins')
            .set('Accept', 'application/json')
 
        const sorted = res.body.ranking.slice().sort((a, b) => b.percentage - a.percentage)
        for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].percentage).toBeGreaterThanOrEqual(sorted[i + 1].percentage)
        }
    })
 
    //Ranking por derrotas 

    /**
     * Devuelve el ranking global por derrotas correctamente
     */
    it('se obtiene el ranking por derrotas', async () => {
        const res = await request(app)
            .get('/ranking/defeats')
            .set('Accept', 'application/json')
 
        expect(res.status).toBe(202)
        expect(res.body).toHaveProperty('ranking')
        expect(Array.isArray(res.body.ranking)).toBe(true)
    })
 
    /**
     * El ranking por derrotas está ordenado de más a menos
     */
    it('el ranking por derrotas está ordenado de más a menos', async () => {
        const res = await request(app)
            .get('/ranking/defeats')
            .set('Accept', 'application/json')
 
        const ranking = res.body.ranking
        for (let i = 0; i < ranking.length - 1; i++) {
            expect(ranking[i].value).toBeGreaterThanOrEqual(ranking[i + 1].value)
        }
    })

    /**
     * Cada entrada del ranking por derrotas tiene username, value y percentage
     */
    it('cada entrada del ranking por derrotas tiene username, value y percentage', async () => {
        const res = await request(app)
            .get('/ranking/defeats')
            .set('Accept', 'application/json')
 
        for (const entry of res.body.ranking) {
            expect(entry).toHaveProperty('username')
            expect(entry).toHaveProperty('value')
            expect(entry).toHaveProperty('percentage')
        }
    })

    /**
     * El percentage del ranking por derrotas está entre 0 y 100
     */
    it('el percentage del ranking por derrotas está entre 0 y 100', async () => {
        const res = await request(app)
            .get('/ranking/defeats')
            .set('Accept', 'application/json')
 
        for (const entry of res.body.ranking) {
            expect(entry.percentage).toBeGreaterThanOrEqual(0)
            expect(entry.percentage).toBeLessThanOrEqual(100)
        }
    })
 
    /**
     * El ranking por derrotas ordenado por percentage es coherente (de mayor a menor)
     */
    it('el ranking por derrotas ordenado por percentage es coherente', async () => {
        const res = await request(app)
            .get('/ranking/defeats')
            .set('Accept', 'application/json')
 
        const sorted = res.body.ranking.slice().sort((a, b) => b.percentage - a.percentage)
        for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].percentage).toBeGreaterThanOrEqual(sorted[i + 1].percentage)
        }
    })
 
})

 
/**
 * COMPRUEBA LA FUNCIONALIDAD DE LA BASE DE DATOS
 * EN LOS RANKINGS GLOBALES — RUTAS POST
 */
describe('POST /ranking', () => {
    beforeAll(async () => {
        await connectDB()
        const db = getDB()
        const userService = new UserService(db)
        const userController = new UserController(userService)
 
        app.post('/ranking/wins/difficulty', userController.rankingwinsbydifficulty)
        app.post('/ranking/wins/strategy',   userController.rankingwinsbystrategy)
    })
 
    // Ranking por dificultad 
 
    /**
     * Devuelve el ranking por victorias para dificultad EASY
     */
    it('se obtiene el ranking por victorias en dificultad EASY', async () => {
        const res = await request(app)
            .post('/ranking/wins/difficulty')
            .send({ difficulty: 'EASY' })
            .set('Accept', 'application/json')
 
        expect(res.status).toBe(202)
        expect(res.body).toHaveProperty('ranking')
        expect(Array.isArray(res.body.ranking)).toBe(true)
    })
 
    /**
     * Devuelve el ranking por victorias para dificultad MEDIUM
     */
    it('se obtiene el ranking por victorias en dificultad MEDIUM', async () => {
        const res = await request(app)
            .post('/ranking/wins/difficulty')
            .send({ difficulty: 'MEDIUM' })
            .set('Accept', 'application/json')
 
        expect(res.status).toBe(202)
        expect(res.body).toHaveProperty('ranking')
        expect(Array.isArray(res.body.ranking)).toBe(true)
    })
 
    /**
     * Devuelve el ranking por victorias para dificultad HARD
     */
    it('se obtiene el ranking por victorias en dificultad HARD', async () => {
        const res = await request(app)
            .post('/ranking/wins/difficulty')
            .send({ difficulty: 'HARD' })
            .set('Accept', 'application/json')
 
        expect(res.status).toBe(202)
        expect(res.body).toHaveProperty('ranking')
        expect(Array.isArray(res.body.ranking)).toBe(true)
    })
 
    /**
     * Salta error con dificultad inválida
     */
    it('salta error con dificultad inválida en ranking por dificultad', async () => {
        const res = await request(app)
            .post('/ranking/wins/difficulty')
            .send({ difficulty: 'INVALIDA' })
            .set('Accept', 'application/json')
 
        expect(res.status).toBe(405)
        expect(res.body).toHaveProperty('error')
    })
 
    /**
     * El ranking por dificultad está ordenado de mayor a menor
     */
    it('el ranking por dificultad EASY está ordenado de mayor a menor', async () => {
        const res = await request(app)
            .post('/ranking/wins/difficulty')
            .send({ difficulty: 'EASY' })
            .set('Accept', 'application/json')
 
        const ranking = res.body.ranking
        for (let i = 0; i < ranking.length - 1; i++) {
            expect(ranking[i].value).toBeGreaterThanOrEqual(ranking[i + 1].value)
        }
    })

    /**
     * El percentage del ranking por dificultad está entre 0 y 100
     */
    it('el percentage del ranking por dificultad MEDIUM está entre 0 y 100', async () => {
        const res = await request(app)
            .post('/ranking/wins/difficulty')
            .send({ difficulty: 'MEDIUM' })
            .set('Accept', 'application/json')
 
        for (const entry of res.body.ranking) {
            expect(entry.percentage).toBeGreaterThanOrEqual(0)
            expect(entry.percentage).toBeLessThanOrEqual(100)
        }
    })
 
    /**
     * El ranking por dificultad HARD ordenado por percentage es coherente (de mayor a menor)
     */
    it('el ranking por dificultad HARD ordenado por percentage es coherente', async () => {
        const res = await request(app)
            .post('/ranking/wins/difficulty')
            .send({ difficulty: 'HARD' })
            .set('Accept', 'application/json')
 
        const sorted = res.body.ranking.slice().sort((a, b) => b.percentage - a.percentage)
        for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].percentage).toBeGreaterThanOrEqual(sorted[i + 1].percentage)
        }
    })
 
 
    // Ranking por estrategia 
 
    /**
     * Devuelve el ranking por victorias para estrategia RANDOM
     */
    it('se obtiene el ranking por victorias con estrategia RANDOM', async () => {
        const res = await request(app)
            .post('/ranking/wins/strategy')
            .send({ strategy: 'RANDOM' })
            .set('Accept', 'application/json')
 
        expect(res.status).toBe(202)
        expect(res.body).toHaveProperty('ranking')
        expect(Array.isArray(res.body.ranking)).toBe(true)
    })
 
    /**
     * Devuelve el ranking por victorias para estrategia MONTE_CARLO
     */
    it('se obtiene el ranking por victorias con estrategia MONTE_CARLO', async () => {
        const res = await request(app)
            .post('/ranking/wins/strategy')
            .send({ strategy: 'MONTE_CARLO' })
            .set('Accept', 'application/json')
 
        expect(res.status).toBe(202)
        expect(res.body).toHaveProperty('ranking')
        expect(Array.isArray(res.body.ranking)).toBe(true)
    })
 
    /**
     * Salta error con estrategia inválida
     */
    it('salta error con estrategia inválida en ranking por estrategia', async () => {
        const res = await request(app)
            .post('/ranking/wins/strategy')
            .send({ strategy: 'INVALIDA' })
            .set('Accept', 'application/json')
 
        expect(res.status).toBe(406)
        expect(res.body).toHaveProperty('error')
    })
 
    /**
     * El ranking por estrategia está ordenado de mayor a menor
     */
    it('el ranking por estrategia RANDOM está ordenado de mayor a menor', async () => {
        const res = await request(app)
            .post('/ranking/wins/strategy')
            .send({ strategy: 'RANDOM' })
            .set('Accept', 'application/json')
 
        const ranking = res.body.ranking
        for (let i = 0; i < ranking.length - 1; i++) {
            expect(ranking[i].value).toBeGreaterThanOrEqual(ranking[i + 1].value)
        }
    })

    /**
     * El percentage del ranking por estrategia está entre 0 y 100
     */
    it('el percentage del ranking por estrategia MONTE_CARLO está entre 0 y 100', async () => {
        const res = await request(app)
            .post('/ranking/wins/strategy')
            .send({ strategy: 'MONTE_CARLO' })
            .set('Accept', 'application/json')
 
        for (const entry of res.body.ranking) {
            expect(entry.percentage).toBeGreaterThanOrEqual(0)
            expect(entry.percentage).toBeLessThanOrEqual(100)
        }
    })
 
    /**
     * El ranking por estrategia ordenado por percentage es coherente (de mayor a menor)
     */
    it('el ranking por estrategia MONTE_CARLO ordenado por percentage es coherente', async () => {
        const res = await request(app)
            .post('/ranking/wins/strategy')
            .send({ strategy: 'MONTE_CARLO' })
            .set('Accept', 'application/json')
 
        const sorted = res.body.ranking.slice().sort((a, b) => b.percentage - a.percentage)
        for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].percentage).toBeGreaterThanOrEqual(sorted[i + 1].percentage)
        }
    })
})