/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCKERY_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
