import { describe, it, expect } from 'vitest'

const User = require('../src/user-model.js')

describe('User model', () => {
  it('crea usuario con nombre y contraseña', () => {
    const user = new User('test_user', 'TestPass123')

    expect(user.username).toBe('test_user')
    expect(user.password).toBe('TestPass123')
  })

  it('establece createdAt a Date por defecto', () => {
    const before = Date.now()
    const user = new User('test_user', 'TestPass123')
    const after = Date.now()

    expect(user.createdAt).toBeInstanceOf(Date)
    expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before)
    expect(user.createdAt.getTime()).toBeLessThanOrEqual(after)
  })

  it('usa la fecha proporcionada para createdAt', () => {
    const customDate = new Date('2026-01-15T10:30:00.000Z')
    const user = new User('test_user', 'TestPass123', customDate)

    expect(user.createdAt).toBe(customDate)
    expect(user.createdAt.toISOString()).toBe('2026-01-15T10:30:00.000Z')
  })
})
