/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL_WA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
