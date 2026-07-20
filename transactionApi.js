/* ============================================================
   js/api/targetApi.js — TAHAP 6 (Wishlist / Target Tabungan)
   ============================================================ */

(function (global) {
  'use strict';

  function getTarget() {
    return global.NUMD_API.postWithRetry('getTarget', {});
    // -> { id, nama_target, target_nominal, total_saving, kurang, persen, ... }
  }

  function createTarget(namaTarget, targetNominal) {
    return global.NUMD_API.postWithRetry('createTarget', {
      nama_target: namaTarget,
      target_nominal: targetNominal,
    });
    // -> { id, message, new_achievements }
  }

  function updateTarget(changes) {
    return global.NUMD_API.postWithRetry('updateTarget', changes);
    // -> { message }
  }

  function completeTarget() {
    return global.NUMD_API.postWithRetry('completeTarget', {});
    // -> { message, hof_id, total_hari, total_saving, total_saving_tx, new_achievements }
  }

  /**
   * CATATAN: endpoint 'deleteTarget' BELUM ada di backend saat ini
   * (lihat laporan analisis Tahap 6 — menunggu persetujuan). Fungsi
   * ini sudah disiapkan supaya begitu backend disetujui & disambungkan,
   * pemanggil (syncManager/script.js) tidak perlu diubah lagi — cukup
   * hapus flag NOT_IMPLEMENTED di sisi pemanggil.
   */
  function deleteTarget() {
    return global.NUMD_API.postWithRetry('deleteTarget', {});
  }

  global.NUMD_TARGET_API = {
    getTarget: getTarget,
    createTarget: createTarget,
    updateTarget: updateTarget,
    completeTarget: completeTarget,
    deleteTarget: deleteTarget,
  };
})(window);
