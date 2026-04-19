import request from 'supertest'
import { app, startServer } from '../users-service.js'
const { connectDB, getDB } = require('../src/database/db.js')
const UserService = require('../src/user-service.js')
const UserController = require('../src/user-controller.js')

async function setup(username, password) {
    await startServer()
    const db = getDB()
    const userService = new UserService(db)
    const userController = new UserController(userService)
        
    async function setup(username, password) {
    return request(app)
        .post('/createuser')
        .send({ username, password })
        .set('Accept', 'application/json')}
}

async function takedown(username) {
    await connectDB()
    const db = getDB()
    const userService = new UserService(db)
    const userController = new UserController(userService)
        
    app.post('/deleteuser', userController.deleteuser)

    return request(app)
        .post('/deleteuser')
        .send({ username })
        .set('Accept', 'application/json')
}

export { setup, takedown };
