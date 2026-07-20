/* ============================================================
   NABUNG UNTUK MASA DEPAN — js/api/apiClient.js
   TAHAP 6: Lapisan komunikasi inti ke Google Apps Script Web App.

   Semua modul api/*.js lain (authApi, transactionApi, dst) memakai
   client ini — tidak ada yang memanggil fetch() langsung supaya
   perilaku timeout/retry/error selalu konsisten di satu tempat.

   CATATAN PENTING soal Content-Type:
   Backend (doPost di 08_Main.gs) mendukung dua cara membaca body:
     1. Content-Type: application/json  -> e.postData.contents
     2. Selain itu                      -> JSON.parse(e.parameter.payload)
   Google Apps Script Web App TIDAK mengimplementasikan doOptions(),
   jadi request dengan Content-Type: application/json akan memicu
   CORS preflight (OPTIONS) yang akan GAGAL. Karena itu client ini
   SENGAJA mengirim body sebagai application/x-www-form-urlencoded
   (field "payload" berisi JSON string) — ini "simple request" yang
   tidak memicu preflight, dan persis cocok dengan jalur
   e.parameter.payload yang sudah disiapkan backend.
   ============================================================ */

(function (global) {
  'use strict';

  const DEFAULT_TIMEOUT_MS = 12000;
  const PING_TIMEOUT_MS = 6000;

  const config = {
    baseUrl: '',
    token: null,
  };

  function ApiError(message, code, httpStatus) {
    this.name = 'ApiError';
    this.message = message;
    this.code = code || 'UNKNOWN';
    this.httpStatus = httpStatus || null;
  }
  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  function configure(baseUrl, token) {
    config.baseUrl = (baseUrl || '').trim();
    if (token !== undefined) config.token = token;
  }

  function setToken(token) {
    config.token = token;
  }

  function clearToken() {
    config.token = null;
  }

  function getConfig() {
    return { baseUrl: config.baseUrl, hasToken: Boolean(config.token) };
  }

  function isConfigured() {
    return Boolean(config.baseUrl);
  }

  function isAuthenticated() {
    return Boolean(config.baseUrl && config.token);
  }

  /**
   * Panggilan tunggal ke backend. Melempar ApiError untuk semua
   * kegagalan (network, timeout, JSON tidak valid, atau
   * success:false dari backend) — pemanggil cukup try/catch satu
   * jenis error.
   */
  async function post(action, data, opts) {
    opts = opts || {};

    if (!config.baseUrl) {
      throw new ApiError('Backend belum dikonfigurasi.', 'NOT_CONFIGURED');
    }

    const timeoutMs = opts.timeout || DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const payload = {
      action: action,
      token: opts.skipAuth ? undefined : config.token,
      data: data || {},
    };

    const body = new URLSearchParams();
    body.set('payload', JSON.stringify(payload));

    let response;
    try {
      response = await fetch(config.baseUrl, {
        method: 'POST',
        body: body, // Content-Type: application/x-www-form-urlencoded otomatis dari browser — hindari CORS preflight
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      if (err && err.name === 'AbortError') {
        throw new ApiError('Waktu permintaan habis. Periksa koneksi internetmu.', 'TIMEOUT');
      }
      throw new ApiError('Tidak dapat terhubung ke server.', 'NETWORK_ERROR');
    }
    clearTimeout(timer);

    if (!response.ok) {
      throw new ApiError('Server merespons dengan status ' + response.status + '.', 'HTTP_ERROR', response.status);
    }

    let json;
    try {
      json = await response.json();
    } catch (err) {
      throw new ApiError('Format respons server tidak dapat dibaca.', 'INVALID_JSON');
    }

    // Validasi bentuk respons — jangan pernah percaya buta pada data eksternal.
    if (!json || typeof json !== 'object' || typeof json.success !== 'boolean') {
      throw new ApiError('Struktur respons server tidak dikenali.', 'INVALID_SHAPE');
    }

    if (!json.success) {
      // Pesan error dari backend ditampilkan apa adanya (sudah dalam Bahasa
      // Indonesia & aman/user-facing di kode GAS-nya), tapi kode HTTP/detail
      // internal lain tidak pernah diteruskan ke UI.
      throw new ApiError(json.error || 'Permintaan gagal diproses.', 'API_ERROR', json.code);
    }

    return json.data;
  }

  /**
   * Sama seperti post(), tapi otomatis mencoba ulang untuk error yang
   * bersifat sementara (network/timeout/HTTP 5xx) — TIDAK mengulang
   * error bisnis (validasi, unauthorized) karena mengulang tidak akan
   * mengubah hasil.
   */
  async function postWithRetry(action, data, opts) {
    opts = opts || {};
    const maxRetries = opts.retries !== undefined ? opts.retries : 2;
    let lastErr;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await post(action, data, opts);
      } catch (err) {
        lastErr = err;
        const retriable = err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT' ||
          (err.code === 'HTTP_ERROR' && err.httpStatus >= 500);
        if (!retriable || attempt >= maxRetries) throw err;
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt))); // backoff: 500ms, 1s, 2s...
      }
    }
    throw lastErr;
  }

  /**
   * Health check ringan lewat doGet (tidak butuh token). Dipakai
   * ConnectionManager untuk tahu apakah backend benar-benar bisa
   * dihubungi, bukan cuma "ada internet".
   */
  async function ping(baseUrl) {
    const url = (baseUrl || config.baseUrl || '').trim();
    if (!url) return false;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
      const res = await fetch(url, { method: 'GET', signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return false;
      const json = await res.json();
      return Boolean(json && json.status === 'ok');
    } catch (e) {
      return false;
    }
  }

  global.NUMD_API = {
    ApiError: ApiError,
    configure: configure,
    setToken: setToken,
    clearToken: clearToken,
    getConfig: getConfig,
    isConfigured: isConfigured,
    isAuthenticated: isAuthenticated,
    post: post,
    postWithRetry: postWithRetry,
    ping: ping,
  };
})(window);
