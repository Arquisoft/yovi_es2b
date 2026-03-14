import { Given, When, Then } from '@cucumber/cucumber'

Given('the register page is open', async function () {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  await page.goto('http://localhost:5173')
})

When('I navigate to signup and register with valid credentials', async function () {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  await page.click('button:has-text("Regístrate")')
  await page.fill('#username', `TestUser_${Date.now()}`)
  await page.fill('#password', 'Test1234')
  await page.click('.submit-button')
})

Then('I should see the home screen', async function () {
  const page = this.page
  if (!page) throw new Error('Page not initialized')
  await page.waitForSelector('.initial-screen', { timeout: 15000 })
})
