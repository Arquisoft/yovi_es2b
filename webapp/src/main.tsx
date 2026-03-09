import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import InitialScreen from "./screens/init/InitialScreen.tsx";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InitialScreen />
  </StrictMode>,
)
