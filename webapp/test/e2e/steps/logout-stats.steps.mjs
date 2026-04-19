import { When, Then } from '@cucumber/cucumber'

// Hace clic en el botón "Mis estadísticas" desde el menú principal
When('navego a mis estadísticas', async function () {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.click('button:has-text("Mis estadísticas")')
})

// Verifica que se muestra el menú de selección de estadísticas
Then('debería ver la pantalla de estadísticas', async function () {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.waitForSelector('.stats-screen', { timeout: 15000 })
})

// Hace clic en el botón "Ver todas las estadísticas"
When('navego a todas las estadísticas', async function () {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.click('button:has-text("Ver todas las estadísticas")')
})

// Verifica que se muestra la tabla con todas las estadísticas
Then('debería ver la pantalla de todas las estadísticas', async function () {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.waitForSelector('.stats-total-screen', { timeout: 15000 })
})

// Hace clic en el botón "Ver estadísticas filtradas"
When('navego a las estadísticas filtradas', async function () {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.click('button:has-text("Ver estadísticas filtradas")')
})

// Verifica que se muestra la pantalla de estadísticas filtradas
Then('debería ver la pantalla de estadísticas filtradas', async function () {
  const page = this.page
  if (!page) throw new Error('La página no está inicializada')
  await page.waitForSelector('.stats-screen-filter', { timeout: 15000 })
})