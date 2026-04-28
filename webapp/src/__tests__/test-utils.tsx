import { render } from '@testing-library/react'
import { ReactNode } from 'react'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { Theme } from '../screens/modo_tema/Theme'

// Wrapper global
export function renderWithProviders(ui: ReactNode) {
  localStorage.setItem('yovi-locale', 'es')

  return render(
    <LanguageProvider>
      <Theme>
        {ui}
      </Theme>
    </LanguageProvider>
  )
}