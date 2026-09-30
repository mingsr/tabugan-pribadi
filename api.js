/* Konfigurasi & helper API global (dipakai App Shell).
 * Request: POST form-urlencoded, field `payload` = JSON {action, token, data} (sesuai doPost; tanpa preflight CORS).
 * Respons: {success:true,data} | {success:false,error,code}. HTTP status selalu 200.
 * Token disimpan di localStorage (key `token`), sama dengan yang dibaca halaman Statistik & Pengaturan. */
(function (w) {
  'use strict';
  const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbwt8HGwnDW5ZolvkzAtzLuyNGbJClTUQLWivSyANcs4vxWBIsZsFVp8n8DOKQVN-auV/exec',
    TOKEN_KEY: 'token',
    TIMEOUT_MS: 30000,
  };

  const Api = {
    pending: 0,
    onLoading: null,        // (isLoading:boolean) => void
    onUnauthorized: null,   // () => void, dipanggil saat token ditolak backend
    getToken: () => localStorage.getItem(CONFIG.TOKEN_KEY) || '',
    setToken: (t) => localStorage.setItem(CONFIG.TOKEN_KEY, t),
    clearToken() { localStorage.removeItem(CONFIG.TOKEN_KEY); sessionStorage.removeItem(CONFIG.TOKEN_KEY); },

    async call(action, data, opts) {
      const auth = !(opts && opts.auth === false);
      const token = this.getToken();
      if (auth && !token) { const e = new Error('Belum login.'); e.code = 401; e.session = true; throw e; }
      this._busy(1);
      const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), CONFIG.TIMEOUT_MS);
      try {
        const res = await fetch(CONFIG.API_URL, {
          method: 'POST', signal: ctl.signal,
          body: new URLSearchParams({ payload: JSON.stringify({ action, token: auth ? token : '', data: data || {} }) }),
        });
        let json;
        try { json = await res.json(); } catch (_) { throw new Error('Respons server tidak dapat dibaca.'); }
        if (!json || json.success !== true) {
          const e = new Error((json && json.error) || 'Permintaan gagal.'); e.code = json && json.code;
          e.session = auth && e.code === 401 && /^(Unauthorized|Token)/i.test(e.message); // 401 karena token, bukan password salah
          if (e.session && this.onUnauthorized) this.onUnauthorized();
          throw e;
        }
        return json.data || {};
      } catch (err) {
        if (err.name === 'AbortError') { const e = new Error('Server tidak merespons. Coba lagi.'); e.network = true; throw e; }
        if (err instanceof TypeError) { const e = new Error('Tidak dapat terhubung ke server (jaringan atau CORS).'); e.network = true; throw e; }
        throw err;
      } finally { clearTimeout(timer); this._busy(-1); }
    },
    _busy(d) { this.pending = Math.max(0, this.pending + d); if (this.onLoading) this.onLoading(this.pending > 0); },
  };

  w.APP_CONFIG = CONFIG;
  w.Api = Api;
})(window);
