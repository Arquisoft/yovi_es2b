import { Given, When, Then } from '@cucumber/cucumber'

// Navega a la página inicial de la aplicación
Given('la página de registro está abierta', async function () {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.goto('http://localhost:5173')
})

// Registra un nuevo usuario con credenciales únicas y las guarda para usarlas después
When('registro un nuevo usuario y guardo las credenciales', async function () {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  this.testUsername = `TestUser_${Date.now()}`
  this.testPassword = 'Test1234'
  await page.click('button:has-text("Regístrate")')
  await page.fill('#username', this.testUsername)
  await page.fill('#password', this.testPassword)
  await page.click('.submit-button')
})

// Verifica que se muestra la pantalla principal
Then('debería ver la pantalla principal', async function () {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.waitForSelector('.home-screen', { timeout: 15000 })
})

// Hace clic en el botón de cerrar sesión del header
When('hago clic en cerrar sesión', async function () {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.click('[aria-label="Menú de opciones"]')
  await page.click('button:has-text("Cerrar sesión")')
})

// Verifica que se muestra la pantalla de inicio de sesión
Then('debería ver la página de inicio de sesión', async function () {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.waitForSelector('.initial-screen', { timeout: 15000 })
})

// Inicia sesión con las credenciales guardadas durante el registro
When('inicio sesión con las credenciales guardadas', async function () {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.fill('#username', this.testUsername)
  await page.fill('#password', this.testPassword)
  await page.click('.submit-button')
})
