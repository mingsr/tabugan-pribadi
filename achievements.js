/* ============================================================
   js/api/syncManager.js — TAHAP 6
   Mengatur status koneksi (configured/online/authenticated),
   proses login/connect, dan ANTREAN OFFLINE: setiap mutasi yang
   gagal terkirim (network error) disimpan di Local Storage dan
   diputar ulang otomatis begitu koneksi & sesi kembali valid.

   Modul ini TIDAK tahu apa-apa soal DOM/UI — hanya menyediakan
   status + event lewat onStatusChange(). script.js yang
   menerjemahkan status ini jadi indikator/toast.
   ============================================================ */

(function (global) {
  'use strict';

  const CONN_STORAGE_KEY = 'numd_connection';
  const QUEUE_STORAGE_KEY = 'numd_sync_queue';

  const state = {
    configured: false,   // sudah pernah connect & tersimpan baseUrl+token
    online: true,        // backend bisa dihubungi (hasil ping), bukan sekadar navigator.onLine
    authenticated: false,// token valid (hasil validateToken)
    baseUrl: '',
    checking: false,
    lastCheckedAt: null,
    lastSyncError: null,
  };

  const listeners = [];
  function onStatusChange(cb) { listeners.push(cb); }
  function emitStatus() {
    listeners.forEach(cb => {
      try { cb(getStatus()); } catch (e) { /* jangan biarkan 1 listener rusak yang lain */ }
    });
  }
  function getStatus() {
    return Object.assign({}, state, { queueLength: getQueueLength() });
  }

  // ---------------------------------------------------------
  // Konfigurasi koneksi (baseUrl + token) — token TIDAK expired
  // secara eksplisit di sini; kalau backend bilang expired,
  // validateToken() akan mengembalikan valid:false dan kita minta
  // login ulang lewat UI.
  // ---------------------------------------------------------
  function loadConnectionConfig() {
    try {
      const raw = localStorage.getItem(CONN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConnectionConfig(baseUrl, token) {
    try {
      localStorage.setItem(CONN_STORAGE_KEY, JSON.stringify({ baseUrl: baseUrl, token: token }));
    } catch (e) { /* storage tidak tersedia — koneksi tetap jalan untuk sesi ini saja */ }
  }

  function clearConnectionConfig() {
    try { localStorage.removeItem(CONN_STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  async function init() {
    const saved = loadConnectionConfig();
    if (saved && saved.baseUrl) {
      state.configured = true;
      state.baseUrl = saved.baseUrl;
      global.NUMD_API.configure(saved.baseUrl, saved.token || null);
      await checkConnectivity();
    } else {
      emitStatus();
    }

    window.addEventListener('online', () => { checkConnectivity(); });
    window.addEventListener('offline', () => {
      state.online = false;
      state.authenticated = false;
      emitStatus();
    });
  }

  /**
   * Cek dua lapis: (1) backend bisa dihubungi (ping doGet, tanpa
   * auth), (2) kalau ada token, apakah token itu masih valid. Dua
   * lapis ini penting supaya pesan ke user akurat — "server tidak
   * bisa dihubungi" itu beda kasus dari "sesi kamu berakhir, login
   * lagi".
   */
  async function checkConnectivity() {
    if (!state.configured) { emitStatus(); return false; }

    state.checking = true;
    emitStatus();

    const reachable = await global.NUMD_API.ping(state.baseUrl);
    state.online = reachable;
    state.lastCheckedAt = new Date().toISOString();

    if (reachable && global.NUMD_API.getConfig().hasToken) {
      try {
        const result = await global.NUMD_AUTH_API.validateToken();
        state.authenticated = Boolean(result && result.valid);
        state.lastSyncError = null;
      } catch (err) {
        state.authenticated = false;
        state.lastSyncError = err.message;
      }
    } else {
      state.authenticated = false;
    }

    state.checking = false;
    emitStatus();

    if (state.online && state.authenticated) {
      await flushQueue();
    }
    return state.online && state.authenticated;
  }

  async function connect(baseUrl, username, password) {
    const cleanUrl = (baseUrl || '').trim();
    if (!cleanUrl) throw new global.NUMD_API.ApiError('URL Web App wajib diisi.', 'VALIDATION');

    global.NUMD_API.configure(cleanUrl, null);
    const token = await global.NUMD_AUTH_API.login(username, password); // melempar ApiError kalau gagal

    global.NUMD_API.setToken(token);
    saveConnectionConfig(cleanUrl, token);

    state.configured = true;
    state.baseUrl = cleanUrl;
    state.online = true;
    state.authenticated = true;
    state.lastSyncError = null;
    emitStatus();

    await flushQueue();
    return true;
  }

  function disconnect() {
    clearConnectionConfig();
    global.NUMD_API.clearToken();
    state.configured = false;
    state.authenticated = false;
    state.baseUrl = '';
    emitStatus();
  }

  // ---------------------------------------------------------
  // Antrean offline. Item disimpan sebagai data polos (bukan
  // fungsi) supaya aman di-serialize ke Local Storage; fungsi
  // API sesungguhnya di-resolve lewat DISPATCH saat diputar ulang.
  // ---------------------------------------------------------
  function loadQueue() {
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveQueue(queue) {
    try { localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue)); } catch (e) { /* ignore */ }
  }

  function enqueue(type, payload) {
    const queue = loadQueue();
    queue.push({
      id: 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type: type,
      payload: payload,
      queuedAt: new Date().toISOString(),
    });
    saveQueue(queue);
    emitStatus();
  }

  function getQueueLength() {
    return loadQueue().length;
  }

  const DISPATCH = {
    ADD_TX: (p) => global.NUMD_TX_API.addTransaction(p),
    EDIT_TX: (p) => global.NUMD_TX_API.editTransaction(p.id, p.changes),
    DELETE_TX: (p) => global.NUMD_TX_API.deleteTransaction(p.id),
    CREATE_TARGET: (p) => global.NUMD_TARGET_API.createTarget(p.nama_target, p.target_nominal),
    UPDATE_TARGET: (p) => global.NUMD_TARGET_API.updateTarget(p.changes),
    COMPLETE_TARGET: () => global.NUMD_TARGET_API.completeTarget(),
  };

  /**
   * Putar ulang antrean secara berurutan. Error jaringan/timeout ->
   * item disimpan lagi untuk dicoba nanti. Error bisnis (validasi,
   * dsb) -> item dibuang, karena mengulang tidak akan mengubah hasil
   * dan kalau dibiarkan akan memblokir item lain selamanya.
   */
  async function flushQueue() {
    if (!state.online || !state.authenticated) return { success: 0, failed: 0 };

    const queue = loadQueue();
    if (queue.length === 0) return { success: 0, failed: 0 };

    let successCount = 0;
    const remaining = [];

    for (const item of queue) {
      const handler = DISPATCH[item.type];
      if (!handler) continue; // tipe tidak dikenal (data korup/versi lama) — buang

      try {
        await handler(item.payload);
        successCount++;
      } catch (err) {
        const retriable = err && (err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT' ||
          (err.code === 'HTTP_ERROR' && err.httpStatus >= 500));
        if (retriable) remaining.push(item);
        // Error bisnis (API_ERROR/VALIDATION) sengaja dibuang dari antrean.
      }
    }

    saveQueue(remaining);
    if (remaining.length > 0) state.lastSyncError = 'Sebagian data belum tersinkron.';
    emitStatus();
    return { success: successCount, failed: remaining.length };
  }

  global.NUMD_SYNC = {
    init: init,
    connect: connect,
    disconnect: disconnect,
    checkConnectivity: checkConnectivity,
    getStatus: getStatus,
    onStatusChange: onStatusChange,
    enqueue: enqueue,
    getQueueLength: getQueueLength,
    flushQueue: flushQueue,
  };
})(window);
