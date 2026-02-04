/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Tu pourras ajouter d'autres variables ici plus tard (ex: VITE_STRIPE_KEY)
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
