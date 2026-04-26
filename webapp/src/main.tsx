import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './screens/modo_tema/Theme.css'
import { Theme } from './screens/modo_tema/Theme.tsx'
import { LanguageProvider } from './i18n/LanguageProvider.tsx'

import InitialScreen from "./screens/init/InitialScreen.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme>
      <LanguageProvider>
        <InitialScreen />
      </LanguageProvider>
    </Theme>
  </StrictMode>,
)
