/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID: string
  readonly VITE_CLARITY_ID: string
  readonly VITE_HOTJAR_ID: string
  readonly VITE_FB_PIXEL_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
