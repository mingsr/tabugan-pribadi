/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Web App URL Google Apps Script (backend RPC tunggal).
   * Wajib diisi lewat file .env — lihat .env.example.
   */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
