import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './screens/Theme.css'
import { Theme } from './screens/modo_tema/Theme.tsx'

import InitialScreen from "./screens/init/InitialScreen.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Theme>
      <InitialScreen />
    </Theme>
  </StrictMode>,
)
