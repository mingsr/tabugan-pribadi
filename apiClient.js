/* ============================================================
   js/api/statisticsApi.js — TAHAP 6
   Dashboard & Statistik. "Sinkron otomatis" dicapai dengan
   memanggil getDashboard setiap kali data transaksi/target berubah
   (dipanggil dari syncManager, bukan di sini — modul ini murni
   pemetaan endpoint).
   ============================================================ */

(function (global) {
  'use strict';

  function getDashboard() {
    return global.NUMD_API.postWithRetry('getDashboard', {});
  }

  function getMonthlyStat(bulan, tahun) {
    return global.NUMD_API.postWithRetry('getMonthlyStat', { bulan: bulan, tahun: tahun });
  }

  function getMonthlyTrend(months) {
    return global.NUMD_API.postWithRetry('getMonthlyTrend', { months: months || 6 });
  }

  global.NUMD_STATS_API = {
    getDashboard: getDashboard,
    getMonthlyStat: getMonthlyStat,
    getMonthlyTrend: getMonthlyTrend,
  };
})(window);
