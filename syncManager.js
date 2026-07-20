/* ============================================================
   js/api/authApi.js — TAHAP 6
   Login & validasi token. Backend menyimpan password sebagai
   SHA-256 hash (lihat sha256() di 01_Utils.gs) — jadi frontend
   HARUS mengirim hash, bukan password polos, meniru persis logika
   yang sama (Web Crypto API, bawaan browser, tanpa library).
   ============================================================ */

(function (global) {
  'use strict';

  async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async function login(username, password) {
    const passwordHash = await sha256Hex(password);
    const result = await global.NUMD_API.post('login', { username, password_hash: passwordHash }, { skipAuth: true });
    // result: { token }
    return result.token;
  }

  async function validateToken() {
    // token dikirim otomatis oleh apiClient dari config saat ini
    const result = await global.NUMD_API.post('validateToken', {});
    return result; // { valid, username }
  }

  async function changePassword(oldPassword, newPassword) {
    const oldHash = await sha256Hex(oldPassword);
    const newHash = await sha256Hex(newPassword);
    return global.NUMD_API.post('changePassword', { old_password_hash: oldHash, new_password_hash: newHash });
  }

  global.NUMD_AUTH_API = {
    login: login,
    validateToken: validateToken,
    changePassword: changePassword,
  };
})(window);
