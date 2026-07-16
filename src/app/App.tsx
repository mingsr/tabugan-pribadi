import { Providers } from '@/app/providers'
import { AppRouter } from '@/app/router'

/**
 * Root aplikasi.
 *
 * Sejak Tahap 3.4 (Authentication + Routing dasar), `App.tsx` merender
 * `AppRouter` sungguhan (bukan lagi `DesignSystemPreview` dari Tahap 3.2).
 * Katalog komponen Tahap 3.2 tidak dihapus konsepnya — hanya sudah
 * bukan konten default aplikasi lagi, karena routing publik/terproteksi
 * sudah nyata (`/login` vs `/`).
 */
function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}

export default App
