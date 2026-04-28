import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { LanguageProvider } from '../i18n/LanguageProvider'

// Wrapper global
export function renderWithProviders(ui: ReactNode) {
  localStorage.setItem('yovi-locale', 'es')

  return render(
    <LanguageProvider>
        {ui}
    </LanguageProvider>
  )
}