import { Given, When, Then } from '@cucumber/cucumber'

// Hace clic en "Regístrate" para ir al formulario de registro
Given('estoy en el formulario de registro', async function () {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.click('button:has-text("Regístrate")')
})

// Rellena el formulario con un usuario aleatorio y la contraseña del ejemplo, luego lo envia
When('intento registrarme con la contraseña {string}', async function (contraseña) {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.fill('#username', `TestError_${Date.now()}`)
  await page.fill('#password', contraseña)
  await page.click('.submit-button')
})

// Comprueba que el mensaje de error que aparece es el que toca
Then('debería ver el mensaje de error {string}', async function (mensajeEsperado) {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.waitForSelector('.error-message', { timeout: 15000 })
  const texto = await page.locator('.error-message').textContent()
  if (!texto.includes(mensajeEsperado)) {
    throw new Error(`Se esperaba el mensaje "${mensajeEsperado}" pero aparecio: "${texto}"`)
  }
})