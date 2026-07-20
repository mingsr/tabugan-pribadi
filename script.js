/* ============================================================
   js/api/transactionApi.js — TAHAP 6
   Pemetaan tipis ke action backend untuk modul Transaksi.
   Bentuk data yang dikirim/diterima SENGAJA disamakan persis
   dengan field yang dipakai handleAddTransaction/handleGetTransactions
   dkk di 03_Transactions.gs supaya tidak perlu adaptasi field di
   pemanggilnya (syncManager / script.js).
   ============================================================ */

(function (global) {
  'use strict';

  function addTransaction(tx) {
    return global.NUMD_API.postWithRetry('addTransaction', {
      tanggal: tx.tanggal,
      tipe: tx.tipe,
      kategori: tx.kategori,
      nominal: tx.nominal,
      keterangan: tx.keterangan || '',
      target_id: tx.target_id || '',
    });
    // -> { id, message, new_achievements }
  }

  function getTransactions(params) {
    params = params || {};
    return global.NUMD_API.postWithRetry('getTransactions', {
      tipe: params.tipe || '',
      tanggal_mulai: params.tanggal_mulai || '',
      tanggal_selesai: params.tanggal_selesai || '',
      limit: params.limit || 200,
      offset: params.offset || 0,
    });
    // -> { transactions, total, limit, offset }
  }

  function editTransaction(id, changes) {
    const payload = Object.assign({ id: id }, changes);
    return global.NUMD_API.postWithRetry('editTransaction', payload);
    // -> { message }
  }

  function deleteTransaction(id) {
    return global.NUMD_API.postWithRetry('deleteTransaction', { id: id });
    // -> { message }
  }

  global.NUMD_TX_API = {
    addTransaction: addTransaction,
    getTransactions: getTransactions,
    editTransaction: editTransaction,
    deleteTransaction: deleteTransaction,
  };
})(window);
