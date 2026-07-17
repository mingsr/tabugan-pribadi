/* ============================================================
   NABUNG UNTUK MASA DEPAN — script.js
   TAHAP 1: Dashboard shell, dummy data, dark/light mode.
   TAHAP 2: Modul Transaksi (CRUD, search, filter, sort,
            modal form, validasi, toast, empty & loading state).

   Struktur data & aturan validasi sengaja dibuat mengikuti
   backend Google Apps Script (00_Config.gs) supaya integrasi
   API di Tahap 6 tinggal mengganti sumber data, bukan mengganti
   struktur maupun aturan.
   ============================================================ */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     0. CONSTANTS (mengikuti backend TX_TYPE)
  --------------------------------------------------------- */

  const TX_TYPE = {
    INCOME: 'INCOME',
    EXPENSE: 'EXPENSE',
    SAVING: 'SAVING',
    WITHDRAWAL: 'WITHDRAWAL',
  };

  const TODAY = '2026-07-16'; // dipakai sebagai acuan "hari ini" untuk data dummy

  const KATEGORI_SUGGESTIONS = {
    INCOME: ['Uang Saku', 'Gaji', 'Bonus', 'Hadiah', 'Freelance', 'Lainnya'],
    EXPENSE: ['Makanan', 'Transportasi', 'Jajan', 'Belanja', 'Tagihan', 'Hiburan', 'Lainnya'],
    SAVING: ['Tabungan Laptop', 'Tabungan Darurat', 'Lainnya'],
    WITHDRAWAL: ['Penarikan Tabungan', 'Kebutuhan Mendesak', 'Lainnya'],
  };

  /* ---------------------------------------------------------
     1. DUMMY DATA
  --------------------------------------------------------- */

  const DUMMY = {
    user: { nama: 'Fajar' },

    level: {
      level: 3,
      nama: 'Pemula Bijak',
      icon: '🔰',
      threshold_current: 200000,
      threshold_next: 500000,
      next_nama: 'Calon Hemat',
      total_xp: 1280,
      xp_next: 2500,
      progress_persen: 51,
    },

    streak: 6,

    chart_days: [
      { tanggal: '03', income: 0,      expense: 20000, saving: 30000 },
      { tanggal: '04', income: 300000, expense: 15000, saving: 50000 },
      { tanggal: '05', income: 0,      expense: 40000, saving: 0 },
      { tanggal: '06', income: 0,      expense: 10000, saving: 60000 },
      { tanggal: '07', income: 0,      expense: 25000, saving: 40000 },
      { tanggal: '08', income: 300000, expense: 30000, saving: 80000 },
      { tanggal: '09', income: 0,      expense: 12000, saving: 20000 },
      { tanggal: '10', income: 0,      expense: 18000, saving: 45000 },
      { tanggal: '11', income: 0,      expense: 22000, saving: 55000 },
      { tanggal: '12', income: 0,      expense: 8000,  saving: 100000 },
      { tanggal: '13', income: 0,      expense: 15000, saving: 0 },
      { tanggal: '14', income: 0,      expense: 0,     saving: 75000 },
      { tanggal: '15', income: 300000, expense: 25000, saving: 0 },
      { tanggal: '16', income: 0,      expense: 0,     saving: 50000 },
    ],

    achievements: [
      { achievement_key: 'first_save',   nama: 'Receh Pertama',   icon: '🪙', rarity: 'COMMON',   is_unlocked: true  },
      { achievement_key: 'first_100k',   nama: 'Pecahan Seratus', icon: '💰', rarity: 'COMMON',   is_unlocked: true  },
      { achievement_key: 'saving_10',    nama: 'Penabung Pemula', icon: '🐷', rarity: 'COMMON',   is_unlocked: true  },
      { achievement_key: 'target_created', nama: 'Langkah Pertama', icon: '🎯', rarity: 'COMMON', is_unlocked: true  },
      { achievement_key: 'first_1jt',    nama: 'Millionaire I',   icon: '💸', rarity: 'UNCOMMON', is_unlocked: true  },
      { achievement_key: 'first_5jt',    nama: 'Millionaire II',  icon: '💎', rarity: 'RARE',     is_unlocked: false },
      { achievement_key: 'first_10jt',   nama: 'Double Digit',    icon: '🏦', rarity: 'EPIC',     is_unlocked: false },
      { achievement_key: 'laptop_acquired', nama: 'Laptop Acquired', icon: '🚀', rarity: 'ARTIFACT', is_unlocked: false },
    ],
    total_achievements: 47,
    unlocked_achievements: 14,

    // Riwayat transaksi — sumber data untuk modul Transaksi (Tahap 2).
    // Field mengikuti response handleGetTransactions di backend.
    transactions: [
      { id: 'tx025', tanggal: '2026-07-16', tipe: TX_TYPE.SAVING,  kategori: 'Tabungan Laptop',   nominal: 50000,   keterangan: 'Nabung harian',        target_id: '1' },
      { id: 'tx024', tanggal: '2026-07-15', tipe: TX_TYPE.EXPENSE, kategori: 'Makanan',            nominal: 25000,   keterangan: 'Makan siang',          target_id: '' },
      { id: 'tx023', tanggal: '2026-07-15', tipe: TX_TYPE.INCOME,  kategori: 'Uang Saku',          nominal: 300000,  keterangan: 'Uang saku mingguan',   target_id: '' },
      { id: 'tx022', tanggal: '2026-07-14', tipe: TX_TYPE.SAVING,  kategori: 'Tabungan Laptop',   nominal: 75000,   keterangan: 'Sisa jajan',            target_id: '1' },
      { id: 'tx021', tanggal: '2026-07-13', tipe: TX_TYPE.EXPENSE, kategori: 'Transportasi',       nominal: 15000,   keterangan: 'Ongkos angkot',        target_id: '' },
      { id: 'tx020', tanggal: '2026-07-12', tipe: TX_TYPE.SAVING,  kategori: 'Tabungan Laptop',   nominal: 100000,  keterangan: 'Bonus tugas',           target_id: '1' },
      { id: 'tx019', tanggal: '2026-07-12', tipe: TX_TYPE.EXPENSE, kategori: 'Jajan',              nominal: 12000,   keterangan: 'Es kopi',               target_id: '' },
      { id: 'tx018', tanggal: '2026-07-11', tipe: TX_TYPE.EXPENSE, kategori: 'Tagihan',            nominal: 45000,   keterangan: 'Kuota internet',        target_id: '' },
      { id: 'tx017', tanggal: '2026-07-10', tipe: TX_TYPE.SAVING,  kategori: 'Tabungan Laptop',   nominal: 60000,   keterangan: 'Nabung harian',         target_id: '1' },
      { id: 'tx016', tanggal: '2026-07-09', tipe: TX_TYPE.EXPENSE, kategori: 'Hiburan',            nominal: 20000,   keterangan: 'Nonton bareng teman',   target_id: '' },
      { id: 'tx015', tanggal: '2026-07-08', tipe: TX_TYPE.INCOME,  kategori: 'Uang Saku',          nominal: 300000,  keterangan: 'Uang saku mingguan',   target_id: '' },
      { id: 'tx014', tanggal: '2026-07-08', tipe: TX_TYPE.SAVING,  kategori: 'Tabungan Laptop',   nominal: 80000,   keterangan: 'Nabung habis gajian',   target_id: '1' },
      { id: 'tx013', tanggal: '2026-07-07', tipe: TX_TYPE.EXPENSE, kategori: 'Makanan',            nominal: 30000,   keterangan: 'Makan malam',           target_id: '' },
      { id: 'tx012', tanggal: '2026-07-06', tipe: TX_TYPE.SAVING,  kategori: 'Tabungan Laptop',   nominal: 40000,   keterangan: '',                      target_id: '1' },
      { id: 'tx011', tanggal: '2026-07-05', tipe: TX_TYPE.EXPENSE, kategori: 'Transportasi',       nominal: 18000,   keterangan: 'Ongkos ojek online',    target_id: '' },
      { id: 'tx010', tanggal: '2026-07-04', tipe: TX_TYPE.INCOME,  kategori: 'Freelance',          nominal: 250000,  keterangan: 'Bantuin desain poster', target_id: '' },
      { id: 'tx009', tanggal: '2026-07-04', tipe: TX_TYPE.SAVING,  kategori: 'Tabungan Laptop',   nominal: 100000,  keterangan: 'Hasil freelance',       target_id: '1' },
      { id: 'tx008', tanggal: '2026-07-03', tipe: TX_TYPE.EXPENSE, kategori: 'Belanja',            nominal: 55000,   keterangan: 'Alat tulis',            target_id: '' },
      { id: 'tx007', tanggal: '2026-07-02', tipe: TX_TYPE.SAVING,  kategori: 'Tabungan Laptop',   nominal: 45000,   keterangan: 'Nabung harian',         target_id: '1' },
      { id: 'tx006', tanggal: '2026-07-01', tipe: TX_TYPE.INCOME,  kategori: 'Uang Saku',          nominal: 300000,  keterangan: 'Uang saku bulanan',    target_id: '' },
      { id: 'tx005', tanggal: '2026-06-29', tipe: TX_TYPE.WITHDRAWAL, kategori: 'Kebutuhan Mendesak', nominal: 50000, keterangan: 'Servis sepeda',       target_id: '1' },
      { id: 'tx004', tanggal: '2026-06-27', tipe: TX_TYPE.SAVING,  kategori: 'Tabungan Laptop',   nominal: 70000,   keterangan: 'Nabung harian',         target_id: '1' },
      { id: 'tx003', tanggal: '2026-06-24', tipe: TX_TYPE.EXPENSE, kategori: 'Makanan',            nominal: 22000,   keterangan: 'Sarapan',               target_id: '' },
      { id: 'tx002', tanggal: '2026-06-20', tipe: TX_TYPE.SAVING,  kategori: 'Tabungan Laptop',   nominal: 200000,  keterangan: 'THR sisa lebaran',      target_id: '1' },
      { id: 'tx001', tanggal: '2026-06-15', tipe: TX_TYPE.INCOME,  kategori: 'Hadiah',             nominal: 150000,  keterangan: 'Hadiah ulang tahun',   target_id: '' },
    ],
  };

  /* ---------------------------------------------------------
     2. STATE
  --------------------------------------------------------- */

  const state = {
    // Salinan lepas dari DUMMY.transactions supaya CRUD tidak
    // memutasi data sumber secara langsung.
    transactions: DUMMY.transactions.map(t => Object.assign({}, t)),
    filters: {
      search: '',
      tipe: 'ALL',
      sort: 'date_desc',
    },
    txPageLoaded: false,   // sudah pernah fetch (simulasi) atau belum
    editingId: null,       // id transaksi yang sedang diedit, null = mode tambah
    idCounter: 26,

    // Target aktif — hanya boleh SATU dalam satu waktu (mengikuti
    // aturan backend: createTarget menolak jika masih ada target ACTIVE).
    // null = belum ada target aktif.
    target: {
      id: '1',
      nama_target: 'ASUS TUF Gaming A15',
      target_nominal: 20000000,
      tanggal_mulai: '2026-06-01',
      status: 'ACTIVE',
    },
    targetPageLoaded: false,
    targetIdCounter: 2,
  };


  /* ---------------------------------------------------------
     3. UTILITIES
  --------------------------------------------------------- */

  function formatRupiah(n) {
    return 'Rp' + Number(n).toLocaleString('id-ID');
  }

  function formatTanggalPendek(dateStr) {
    const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const d = new Date(dateStr);
    return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
  }

  function relativeTanggal(dateStr) {
    const today = new Date(TODAY);
    const d = new Date(dateStr);
    const diffDays = Math.round((today - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays > 1 && diffDays < 7) return diffDays + ' hari lalu';
    return formatTanggalPendek(dateStr);
  }

  function greetingByHour() {
    const h = new Date().getHours();
    if (h < 10) return 'Selamat pagi,';
    if (h < 15) return 'Selamat siang,';
    if (h < 18) return 'Selamat sore,';
    return 'Selamat malam,';
  }

  function isValidDateString(val) {
    if (!val || typeof val !== 'string') return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
    const parts = val.split('-').map(Number);
    const y = parts[0], m = parts[1], d = parts[2];
    if (m < 1 || m > 12) return false;
    const maxDay = new Date(y, m, 0).getDate();
    return d >= 1 && d <= maxDay;
  }

  function generateId() {
    return 'tx' + String(state.idCounter++).padStart(3, '0');
  }

  function generateTargetId() {
    return String(state.targetIdCounter++);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => (ctx || document).querySelectorAll(sel);

  /* ---------------------------------------------------------
     4. THEME (dark / light)
  --------------------------------------------------------- */

  const ThemeManager = {
    key: 'numd_theme',

    init() {
      let saved = null;
      try { saved = localStorage.getItem(this.key); } catch (e) { /* storage unavailable */ }

      const prefersLight = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: light)').matches;

      const theme = saved || (prefersLight ? 'light' : 'dark');
      this.apply(theme);

      $('#themeToggleDesktop').addEventListener('click', () => this.toggle());
      $('#themeToggleMobile').addEventListener('click', () => this.toggle());
    },

    apply(theme) {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      this.updateIcons(theme);
      try { localStorage.setItem(this.key, theme); } catch (e) { /* ignore */ }
    },

    toggle() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      this.apply(isLight ? 'dark' : 'light');
    },

    updateIcons(theme) {
      const iconClass = theme === 'light' ? 'fa-sun' : 'fa-moon';
      $('#themeToggleDesktop').setAttribute('aria-pressed', theme === 'light');
      $('#themeToggleDesktop').querySelector('i').className = 'fa-solid ' + iconClass;
      $('#themeToggleMobile').querySelector('i').className = 'fa-solid ' + iconClass;
    },
  };

  /* ---------------------------------------------------------
     5. TOAST NOTIFICATION
  --------------------------------------------------------- */

  const Toast = {
    icons: {
      success: 'fa-solid fa-circle-check',
      error: 'fa-solid fa-circle-exclamation',
      info: 'fa-solid fa-circle-info',
    },

    show(message, type) {
      type = type || 'success';
      const container = $('#toastContainer');

      const toast = document.createElement('div');
      toast.className = 'toast toast--' + type;
      toast.innerHTML =
        '<span class="toast-icon"><i class="' + this.icons[type] + '"></i></span>' +
        '<span class="toast-msg"></span>' +
        '<button class="toast-close" type="button" aria-label="Tutup notifikasi"><i class="fa-solid fa-xmark"></i></button>';
      toast.querySelector('.toast-msg').textContent = message;

      container.appendChild(toast);

      const remove = () => {
        toast.classList.add('is-leaving');
        setTimeout(() => toast.remove(), 180);
      };

      toast.querySelector('.toast-close').addEventListener('click', remove);
      const timer = setTimeout(remove, 3500);
      toast.addEventListener('mouseenter', () => clearTimeout(timer));
    },
  };

  /* ---------------------------------------------------------
     6. ROUTER (page switching sederhana, tanpa hash routing)
  --------------------------------------------------------- */

  const Router = {
    current: 'dashboard',
    implementedPages: ['dashboard', 'transaksi', 'target'],

    init() {
      $$('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const page = link.getAttribute('data-page');
          if (page === 'tambah') {
            TxModal.open('add');
            return;
          }
          this.goTo(page);
        });
      });
    },

    goTo(page) {
      if (!this.implementedPages.includes(page)) {
        Toast.show('Fitur "' + capitalize(page) + '" akan hadir di tahap berikutnya 🚧', 'info');
        return;
      }

      this.current = page;

      $('#page-dashboard').hidden = page !== 'dashboard';
      $('#page-transaksi').hidden = page !== 'transaksi';
      $('#page-target').hidden = page !== 'target';

      $$('.sidebar-link, .bottom-nav-link').forEach(l => {
        l.classList.toggle('is-active', l.getAttribute('data-page') === page);
      });

      if (page === 'transaksi') {
        TxPage.ensureLoaded();
      }
      if (page === 'target') {
        TargetPage.ensureLoaded();
      }

      window.scrollTo(0, 0);
    },
  };

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* ---------------------------------------------------------
     7. DASHBOARD RENDER (Tahap 1, dipertahankan & disinkronkan
        dengan state.transactions supaya CRUD di Tahap 2 langsung
        terlihat efeknya di dashboard)
  --------------------------------------------------------- */

  /**
   * Hitung total saldo tabungan (SAVING - WITHDRAWAL) untuk target
   * tertentu dari daftar transaksi. Null-safe.
   */
  function computeTargetSaving(target, transactions) {
    if (!target) return 0;
    let total = 0;
    transactions.forEach(tx => {
      if (String(tx.target_id) === String(target.id)) {
        if (tx.tipe === TX_TYPE.SAVING) total += tx.nominal;
        if (tx.tipe === TX_TYPE.WITHDRAWAL) total -= tx.nominal;
      }
    });
    return Math.max(0, total);
  }

  function computeTargetProgress(target, transactions) {
    if (!target) return { saving: 0, remaining: 0, persen: 0 };
    const saving = computeTargetSaving(target, transactions);
    const persen = target.target_nominal > 0
      ? Math.min(100, Math.round((saving / target.target_nominal) * 10000) / 100)
      : 0;
    return {
      saving: saving,
      remaining: Math.max(0, target.target_nominal - saving),
      persen: persen,
    };
  }

  /**
   * Estimasi tanggal target tercapai berdasarkan rata-rata nabung
   * (tipe SAVING) 30 hari terakhir untuk target ini — meniru logika
   * predictTargetDate() di backend (04_Targets.gs) supaya hasil
   * konsisten begitu API asli disambungkan di Tahap 6.
   */
  function estimateTargetCompletion(target, transactions) {
    if (!target) return { type: 'none' };

    const progress = computeTargetProgress(target, transactions);
    if (progress.remaining <= 0) return { type: 'done' };

    const cutoff = new Date(TODAY);
    cutoff.setDate(cutoff.getDate() - 29);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    let saving30 = 0;
    transactions.forEach(tx => {
      if (String(tx.target_id) === String(target.id) &&
          tx.tipe === TX_TYPE.SAVING &&
          tx.tanggal >= cutoffStr && tx.tanggal <= TODAY) {
        saving30 += tx.nominal;
      }
    });

    const avgPerDay = saving30 / 30;
    if (avgPerDay <= 0) return { type: 'unknown' };

    const daysNeeded = Math.ceil(progress.remaining / avgPerDay);
    const estDate = new Date(TODAY);
    estDate.setDate(estDate.getDate() + daysNeeded);

    return { type: 'estimated', date: estDate.toISOString().slice(0, 10), days: daysNeeded };
  }

  function getDerivedDashboardData() {
    const cutoff = new Date(TODAY);
    cutoff.setDate(cutoff.getDate() - 29);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    let totalIncome = 0, totalExpense = 0;

    state.transactions.forEach(tx => {
      if (tx.tanggal >= cutoffStr && tx.tanggal <= TODAY) {
        if (tx.tipe === TX_TYPE.INCOME) totalIncome += tx.nominal;
        if (tx.tipe === TX_TYPE.EXPENSE) totalExpense += tx.nominal;
      }
    });

    const progress = computeTargetProgress(state.target, state.transactions);

    return {
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      targetSaving: progress.saving,
      targetRemaining: progress.remaining,
      persen: progress.persen,
    };
  }

  function renderGreeting() {
    $('#greetingLabel').textContent = greetingByHour();
    $('#greetingName').textContent = DUMMY.user.nama + ' 👋';
    $('#navLevelText').textContent = 'Lv ' + DUMMY.level.level;
  }

  let balanceVisible = true;

  function renderHeroBalance() {
    const d = getDerivedDashboardData();
    const balance = d.totalIncome - d.totalExpense;

    $('#totalBalance').textContent = balanceVisible ? formatRupiah(balance) : 'Rp••••••••';
    $('#totalIncome').textContent = formatRupiah(d.totalIncome);
    $('#totalExpense').textContent = formatRupiah(d.totalExpense);
  }

  function renderStatCards() {
    const d = getDerivedDashboardData();

    $('#statSavingValue').textContent = formatRupiah(d.targetSaving);
    $('#statSavingValue').nextElementSibling.textContent = state.target
      ? Math.round(d.persen) + '% dari target laptop'
      : 'Belum ada target aktif';

    $('#statStreakValue').textContent = DUMMY.streak + ' Hari';
    $('#statXpValue').textContent = DUMMY.level.total_xp.toLocaleString('id-ID') + ' XP';
    $('#statXpValue').nextElementSibling.textContent = 'Level ' + DUMMY.level.level + ' · ' + DUMMY.level.nama;
  }

  function formatEstimateText(estimate) {
    switch (estimate.type) {
      case 'done': return 'Target sudah tercapai! 🎉';
      case 'estimated': return 'Estimasi tercapai: ' + formatTanggalPendek(estimate.date);
      case 'unknown': return 'Estimasi: belum ada aktivitas menabung';
      default: return '-';
    }
  }

  function renderTargetCard() {
    const hasTarget = Boolean(state.target);
    const d = getDerivedDashboardData();
    const persen = d.persen;

    $('#targetName').textContent = hasTarget ? state.target.nama_target : 'Belum ada target aktif';
    $('#targetPercentBadge').textContent = Math.round(persen) + '%';
    $('#laptopPercentText').textContent = Math.round(persen) + '%';
    $('#targetProgressFill').style.width = persen + '%';
    $('.target-progress-bar').setAttribute('aria-valuenow', String(Math.round(persen)));

    $('#targetCollected').textContent = formatRupiah(d.targetSaving);
    $('#targetRemaining').textContent = formatRupiah(d.targetRemaining);

    const estimate = estimateTargetCompletion(state.target, state.transactions);
    $('#targetEstimate').textContent = hasTarget ? formatEstimateText(estimate).replace('Estimasi tercapai: ', '') : '-';

    const maxFillHeight = 68;
    const fillHeight = (persen / 100) * maxFillHeight;
    const fillRect = $('#fillRect');
    const fillWave = $('#fillWave');
    const topY = 98 - fillHeight;

    requestAnimationFrame(() => {
      fillRect.setAttribute('y', String(topY));
      fillRect.setAttribute('height', String(fillHeight));
      fillWave.style.transform = 'translateY(' + (-fillHeight) + 'px)';
    });
  }


  function renderLevelCard() {
    const l = DUMMY.level;
    $('#levelBadgeIcon').textContent = l.icon;
    $('#levelCardName').textContent = l.nama;
    $('#levelCurrentXp').textContent = l.total_xp.toLocaleString('id-ID');
    $('#levelNextXp').textContent = l.xp_next.toLocaleString('id-ID');
    $('#levelNextName').textContent = l.next_nama || '-';
    $('#xpBarFill').style.width = l.progress_persen + '%';
  }

  function renderSummaryBars() {
    const container = $('#summaryBars');
    container.innerHTML = '';

    const days = DUMMY.chart_days;
    const maxVal = Math.max.apply(null, days.map(d => Math.max(d.income, d.expense, d.saving)).concat([1]));
    const maxBarHeight = 100;

    days.forEach(d => {
      const group = document.createElement('div');
      group.className = 'summary-bar-group';

      [['income', d.income], ['expense', d.expense], ['saving', d.saving]].forEach(pair => {
        const key = pair[0], val = pair[1];
        const bar = document.createElement('div');
        bar.className = 'summary-bar summary-bar--' + key;
        const h = Math.max(2, Math.round((val / maxVal) * maxBarHeight));
        bar.style.height = '0px';
        group.appendChild(bar);
        requestAnimationFrame(() => { bar.style.height = h + 'px'; });
      });

      container.appendChild(group);
    });

    $('#summaryPeriod').textContent = 'Juli 2026';
  }

  const TX_ICON = {
    INCOME: { icon: 'fa-solid fa-arrow-down', cls: 'tx-icon--income' },
    EXPENSE: { icon: 'fa-solid fa-arrow-up', cls: 'tx-icon--expense' },
    SAVING: { icon: 'fa-solid fa-piggy-bank', cls: 'tx-icon--saving' },
    WITHDRAWAL: { icon: 'fa-solid fa-rotate-left', cls: 'tx-icon--expense' },
  };

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function buildTxItemHTML(tx, withActions) {
    const meta = TX_ICON[tx.tipe] || TX_ICON.EXPENSE;
    const sign = (tx.tipe === TX_TYPE.EXPENSE || tx.tipe === TX_TYPE.WITHDRAWAL) ? '-' : '+';
    const amountClass = tx.tipe === TX_TYPE.INCOME ? 'income' : (tx.tipe === TX_TYPE.SAVING ? 'saving' : 'expense');

    let html = ''
      + '<div class="tx-icon ' + meta.cls + '"><i class="' + meta.icon + '"></i></div>'
      + '<div class="tx-info">'
      +   '<p class="tx-title">' + escapeHtml(tx.keterangan || tx.kategori) + '</p>'
      +   '<p class="tx-meta">' + escapeHtml(tx.kategori) + ' · ' + relativeTanggal(tx.tanggal) + '</p>'
      + '</div>'
      + '<div class="tx-amount ' + amountClass + '">' + sign + formatRupiah(tx.nominal) + '</div>';

    if (withActions) {
      html += ''
        + '<div class="tx-actions">'
        +   '<button class="tx-action-btn" data-action="edit" data-id="' + tx.id + '" aria-label="Edit transaksi"><i class="fa-solid fa-pen"></i></button>'
        +   '<button class="tx-action-btn tx-action-btn--danger" data-action="delete" data-id="' + tx.id + '" aria-label="Hapus transaksi"><i class="fa-solid fa-trash"></i></button>'
        + '</div>';
    }

    return html;
  }

  function renderRecentTxList() {
    const list = $('#txList');
    list.innerHTML = '';

    const recent = state.transactions.slice().sort((a, b) => {
      return b.tanggal.localeCompare(a.tanggal) || b.id.localeCompare(a.id);
    }).slice(0, 5);

    recent.forEach(tx => {
      const li = document.createElement('li');
      li.className = 'tx-item';
      li.innerHTML = buildTxItemHTML(tx, false);
      list.appendChild(li);
    });
  }

  function renderAchievementStrip() {
    const strip = $('#achievementStrip');
    strip.innerHTML = '';

    DUMMY.achievements.forEach(a => {
      const item = document.createElement('div');
      item.className = 'badge-item';
      item.setAttribute('data-rarity', a.rarity);
      item.innerHTML = ''
        + '<div class="badge-circle ' + (a.is_unlocked ? '' : 'is-locked') + '">' + (a.is_unlocked ? a.icon : '🔒') + '</div>'
        + '<p class="badge-name">' + (a.is_unlocked ? escapeHtml(a.nama) : '???') + '</p>';
      strip.appendChild(item);
    });

    $('#achievementCountChip').textContent = DUMMY.unlocked_achievements + ' / ' + DUMMY.total_achievements;
  }

  function renderDashboard() {
    renderHeroBalance();
    renderStatCards();
    renderTargetCard();
    renderRecentTxList();
  }

  /* ---------------------------------------------------------
     8. TX PAGE — Riwayat, Search, Filter, Sort, Empty/Loading
  --------------------------------------------------------- */

  const TxPage = {
    async ensureLoaded() {
      if (state.txPageLoaded) {
        this.render();
        return;
      }
      await this.simulateFetch();
      state.txPageLoaded = true;
      this.render();
    },

    async simulateFetch() {
      this.showSkeleton(true);
      await delay(550); // simulasi latency network — pola yang akan dipakai saat integrasi API di Tahap 6
      this.showSkeleton(false);
    },

    showSkeleton(show) {
      const skeleton = $('#txSkeleton');
      const list = $('#txPageList');
      const empty = $('#txEmptyState');
      const count = $('#txResultCount');

      if (show) {
        skeleton.hidden = false;
        list.hidden = true;
        empty.hidden = true;
        count.textContent = 'Memuat transaksi...';
        skeleton.innerHTML = '';
        for (let i = 0; i < 5; i++) {
          const li = document.createElement('li');
          li.className = 'skeleton-item';
          li.innerHTML = ''
            + '<div class="skeleton-block skeleton-icon"></div>'
            + '<div class="skeleton-lines">'
            +   '<div class="skeleton-block skeleton-line skeleton-line--title"></div>'
            +   '<div class="skeleton-block skeleton-line skeleton-line--meta"></div>'
            + '</div>'
            + '<div class="skeleton-block skeleton-amount"></div>';
          skeleton.appendChild(li);
        }
      } else {
        skeleton.hidden = true;
        list.hidden = false;
      }
    },

    getFiltered() {
      const search = state.filters.search;
      const tipe = state.filters.tipe;
      const sort = state.filters.sort;
      const q = search.trim().toLowerCase();

      let rows = state.transactions.filter(tx => {
        if (tipe !== 'ALL' && tx.tipe !== tipe) return false;
        if (q) {
          const haystack = (tx.kategori + ' ' + (tx.keterangan || '')).toLowerCase();
          if (haystack.indexOf(q) === -1) return false;
        }
        return true;
      });

      rows.sort((a, b) => {
        switch (sort) {
          case 'date_asc':
            return a.tanggal.localeCompare(b.tanggal) || a.id.localeCompare(b.id);
          case 'amount_desc':
            return b.nominal - a.nominal;
          case 'amount_asc':
            return a.nominal - b.nominal;
          case 'date_desc':
          default:
            return b.tanggal.localeCompare(a.tanggal) || b.id.localeCompare(a.id);
        }
      });

      return rows;
    },

    render() {
      if (!state.txPageLoaded) return; // masih loading, jangan render dulu

      const rows = this.getFiltered();
      const list = $('#txPageList');
      const empty = $('#txEmptyState');
      const count = $('#txResultCount');

      list.innerHTML = '';

      if (rows.length === 0) {
        list.hidden = true;
        empty.hidden = false;
        count.textContent = '0 transaksi ditemukan';

        const hasActiveFilter = state.filters.search.trim() !== '' || state.filters.tipe !== 'ALL';
        $('#txEmptyMessage').textContent = hasActiveFilter
          ? 'Coba ubah kata kunci pencarian atau filter yang kamu gunakan.'
          : 'Belum ada transaksi tercatat. Yuk mulai catat transaksi pertamamu!';
        $('#txEmptyResetBtn').hidden = !hasActiveFilter;
        return;
      }

      list.hidden = false;
      empty.hidden = true;
      count.textContent = rows.length + ' transaksi ditemukan';

      rows.forEach(tx => {
        const li = document.createElement('li');
        li.className = 'tx-item';
        li.setAttribute('data-id', tx.id);
        li.innerHTML = buildTxItemHTML(tx, true);
        list.appendChild(li);
      });
    },

    init() {
      $('#txSearchInput').addEventListener('input', (e) => {
        state.filters.search = e.target.value;
        this.render();
      });

      $('#txFilterChips').addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        $$('.filter-chip').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        state.filters.tipe = chip.getAttribute('data-filter');
        this.render();
      });

      $('#txSortSelect').addEventListener('change', (e) => {
        state.filters.sort = e.target.value;
        this.render();
      });

      $('#txEmptyResetBtn').addEventListener('click', () => {
        state.filters.search = '';
        state.filters.tipe = 'ALL';
        $('#txSearchInput').value = '';
        $$('.filter-chip').forEach(c => c.classList.toggle('is-active', c.getAttribute('data-filter') === 'ALL'));
        this.render();
      });

      $('#openAddTxBtn').addEventListener('click', () => TxModal.open('add'));

      $('#txPageList').addEventListener('click', (e) => {
        const btn = e.target.closest('.tx-action-btn');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        if (action === 'edit') TxModal.open('edit', id);
        if (action === 'delete') this.confirmDelete(id);
      });
    },

    confirmDelete(id) {
      const tx = state.transactions.find(t => t.id === id);
      if (!tx) return;

      ConfirmModal.open({
        title: 'Hapus transaksi ini?',
        desc: '"' + (tx.keterangan || tx.kategori) + '" senilai ' + formatRupiah(tx.nominal) + ' akan dihapus permanen.',
        confirmLabel: 'Ya, Hapus',
        onConfirm: () => {
          state.transactions = state.transactions.filter(t => t.id !== id);
          Toast.show('Transaksi berhasil dihapus', 'success');
          this.render();
          renderDashboard();
        },
      });
    },
  };

  /* ---------------------------------------------------------
     9. MODAL: TAMBAH / EDIT TRANSAKSI
  --------------------------------------------------------- */

  const TxModal = {
    overlay: null,
    selectedTipe: '',

    init() {
      this.overlay = $('#txModalOverlay');

      $('#txModalClose').addEventListener('click', () => this.close());
      $('#txModalCancel').addEventListener('click', () => this.close());
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });

      $$('.tipe-btn').forEach(btn => {
        btn.addEventListener('click', () => this.selectTipe(btn.getAttribute('data-tipe')));
      });

      $('#txForm').addEventListener('submit', (e) => this.handleSubmit(e));

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.overlay.classList.contains('is-open')) this.close();
      });
    },

    open(mode, id) {
      state.editingId = mode === 'edit' ? id : null;
      this.clearErrors();

      const form = $('#txForm');
      form.reset();

      if (mode === 'edit') {
        const tx = state.transactions.find(t => t.id === id);
        if (!tx) return;

        $('#txModalTitle').textContent = 'Edit Transaksi';
        $('#txFormId').value = tx.id;
        $('#txFormTanggal').value = tx.tanggal;
        $('#txFormNominal').value = tx.nominal;
        $('#txFormKategori').value = tx.kategori;
        $('#txFormKeterangan').value = tx.keterangan || '';
        this.selectTipe(tx.tipe);
        $('#txFormTarget').value = tx.target_id || (state.target ? state.target.id : '');
      } else {
        $('#txModalTitle').textContent = 'Tambah Transaksi';
        $('#txFormId').value = '';
        $('#txFormTanggal').value = TODAY;
        this.selectTipe('EXPENSE');
      }

      this.overlay.hidden = false;
      requestAnimationFrame(() => this.overlay.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
    },

    close() {
      this.overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { this.overlay.hidden = true; }, 220);
    },

    selectTipe(tipe) {
      this.selectedTipe = tipe;
      $('#txFormTipe').value = tipe;

      $$('.tipe-btn').forEach(btn => {
        const active = btn.getAttribute('data-tipe') === tipe;
        btn.setAttribute('aria-checked', String(active));
      });

      const needsTarget = tipe === 'SAVING' || tipe === 'WITHDRAWAL';
      this.syncTargetOptions();
      $('#groupTarget').hidden = !needsTarget || !state.target;

      if (needsTarget && !state.target) {
        this.setFieldError('errTipe', 'txFormTipeGroup', 'Belum ada target aktif. Buat target dulu di halaman Target.');
      } else {
        this.clearFieldError('errTipe');
      }

      const datalist = $('#kategoriSuggestions');
      datalist.innerHTML = '';
      (KATEGORI_SUGGESTIONS[tipe] || []).forEach(k => {
        const opt = document.createElement('option');
        opt.value = k;
        datalist.appendChild(opt);
      });
    },

    // Refresh isi <select id="txFormTarget"> supaya selalu mencerminkan
    // target aktif terkini (bisa berubah karena CRUD di halaman Target).
    syncTargetOptions() {
      const select = $('#txFormTarget');
      const currentVal = select.value;
      select.innerHTML = '';
      if (state.target) {
        const opt = document.createElement('option');
        opt.value = state.target.id;
        opt.textContent = state.target.nama_target;
        select.appendChild(opt);
        select.value = currentVal || state.target.id;
      }
    },

    clearErrors() {
      ['errTipe', 'errTanggal', 'errNominal', 'errKategori'].forEach(id => this.clearFieldError(id));
      $$('.form-group input, .form-group select').forEach(el => el.classList.remove('has-error'));
    },

    clearFieldError(errId) {
      const el = $('#' + errId);
      if (el) el.textContent = '';
    },

    setFieldError(errId, inputId, message) {
      $('#' + errId).textContent = message;
      const input = $('#' + inputId);
      if (input) input.classList.add('has-error');
    },

    /**
     * Validasi mengikuti aturan handleAddTransaction di backend:
     * tanggal, tipe, kategori, nominal wajib diisi;
     * nominal > 0; tanggal format YYYY-MM-DD valid;
     * target_id wajib untuk tipe SAVING / WITHDRAWAL.
     */
    validate(data) {
      this.clearErrors();
      let valid = true;

      if (!data.tipe) {
        this.setFieldError('errTipe', 'txFormTipeGroup', 'Pilih tipe transaksi');
        valid = false;
      }

      if (!data.tanggal || !isValidDateString(data.tanggal)) {
        this.setFieldError('errTanggal', 'txFormTanggal', 'Tanggal wajib diisi dengan format yang benar');
        valid = false;
      }

      if (!data.kategori || data.kategori.trim() === '') {
        this.setFieldError('errKategori', 'txFormKategori', 'Kategori tidak boleh kosong');
        valid = false;
      }

      const nominal = Number(data.nominal);
      if (data.nominal === '' || isNaN(nominal) || nominal <= 0) {
        this.setFieldError('errNominal', 'txFormNominal', 'Nominal harus lebih dari 0');
        valid = false;
      }

      if ((data.tipe === 'SAVING' || data.tipe === 'WITHDRAWAL') && !data.target_id) {
        const msg = state.target
          ? 'Target wajib dipilih untuk tipe Tabungan / Penarikan'
          : 'Belum ada target aktif. Buat target dulu di halaman Target.';
        this.setFieldError('errTipe', 'txFormTipeGroup', msg);
        Toast.show(msg, 'error');
        valid = false;
      }

      return valid;
    },

    async handleSubmit(e) {
      e.preventDefault();

      const data = {
        id: $('#txFormId').value || null,
        tanggal: $('#txFormTanggal').value,
        tipe: $('#txFormTipe').value,
        kategori: $('#txFormKategori').value,
        nominal: $('#txFormNominal').value,
        keterangan: $('#txFormKeterangan').value,
        target_id: (this.selectedTipe === 'SAVING' || this.selectedTipe === 'WITHDRAWAL') ? $('#txFormTarget').value : '',
      };

      if (!this.validate(data)) return;

      const submitBtn = $('#txModalSubmit');
      const isEdit = Boolean(data.id);

      this.setSubmitLoading(submitBtn, true);
      await delay(500); // simulasi round-trip API — akan diganti fetch() sungguhan di Tahap 6

      if (isEdit) {
        const idx = state.transactions.findIndex(t => t.id === data.id);
        if (idx > -1) {
          state.transactions[idx] = Object.assign({}, state.transactions[idx], {
            tanggal: data.tanggal,
            tipe: data.tipe,
            kategori: data.kategori.trim(),
            nominal: Number(data.nominal),
            keterangan: data.keterangan.trim(),
            target_id: data.target_id,
          });
        }
      } else {
        state.transactions.unshift({
          id: generateId(),
          tanggal: data.tanggal,
          tipe: data.tipe,
          kategori: data.kategori.trim(),
          nominal: Number(data.nominal),
          keterangan: data.keterangan.trim(),
          target_id: data.target_id,
        });
      }

      this.setSubmitLoading(submitBtn, false);
      this.close();

      Toast.show(isEdit ? 'Transaksi berhasil diubah' : 'Transaksi berhasil ditambahkan', 'success');

      TxPage.render();
      renderDashboard();
    },

    setSubmitLoading(btn, loading) {
      btn.disabled = loading;
      btn.querySelector('.btn-label').textContent = loading ? 'Menyimpan...' : 'Simpan Transaksi';
      $('#txModalSpinner').hidden = !loading;
    },
  };

  /* ---------------------------------------------------------
     10. MODAL: KONFIRMASI (reusable — dipakai Transaksi & Target)
  --------------------------------------------------------- */

  const ConfirmModal = {
    overlay: null,
    onConfirmCallback: null,

    init() {
      this.overlay = $('#deleteModalOverlay');
      $('#deleteModalCancel').addEventListener('click', () => this.close());
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });
      $('#deleteModalConfirm').addEventListener('click', () => this.confirm());
    },

    /**
     * @param {Object} opts
     * @param {string} opts.title
     * @param {string} opts.desc
     * @param {string} [opts.confirmLabel]
     * @param {Function} opts.onConfirm - async function, dijalankan saat user menekan konfirmasi
     */
    open(opts) {
      $('#deleteModalTitle').textContent = opts.title || 'Hapus data ini?';
      $('#deleteModalDesc').textContent = opts.desc || 'Tindakan ini tidak bisa dibatalkan.';
      $('#deleteModalConfirm').querySelector('.btn-label').textContent = opts.confirmLabel || 'Ya, Hapus';
      this.onConfirmCallback = opts.onConfirm;

      this.overlay.hidden = false;
      requestAnimationFrame(() => this.overlay.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
    },

    close() {
      this.overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { this.overlay.hidden = true; }, 220);
      this.onConfirmCallback = null;
    },

    async confirm() {
      if (!this.onConfirmCallback) return;
      const btn = $('#deleteModalConfirm');
      const originalLabel = btn.querySelector('.btn-label').textContent;

      btn.disabled = true;
      $('#deleteModalSpinner').hidden = false;
      btn.querySelector('.btn-label').textContent = 'Memproses...';

      await delay(450); // simulasi round-trip API

      const callback = this.onConfirmCallback;
      this.close();

      btn.disabled = false;
      $('#deleteModalSpinner').hidden = true;
      btn.querySelector('.btn-label').textContent = originalLabel;

      if (callback) callback();
    },
  };

  /* ---------------------------------------------------------
     11. TARGET PAGE — CRUD, progress, estimasi, empty/loading
  --------------------------------------------------------- */

  const TargetPage = {
    async ensureLoaded() {
      if (state.targetPageLoaded) {
        this.render();
        return;
      }
      await this.simulateFetch();
      state.targetPageLoaded = true;
      this.render();
    },

    async simulateFetch() {
      $('#targetPageSkeleton').hidden = false;
      $('#targetPageCard').hidden = true;
      $('#targetEmptyState').hidden = true;
      await delay(500); // simulasi latency network
      $('#targetPageSkeleton').hidden = true;
    },

    render() {
      if (!state.targetPageLoaded) return;

      const target = state.target;
      $('#openAddTargetBtn').hidden = true; // satu target aktif — tambah hanya lewat empty state

      if (!target) {
        $('#targetPageCard').hidden = true;
        $('#targetEmptyState').hidden = false;
        return;
      }

      $('#targetEmptyState').hidden = true;
      $('#targetPageCard').hidden = false;

      const progress = computeTargetProgress(target, state.transactions);
      const estimate = estimateTargetCompletion(target, state.transactions);

      $('#targetPageName').textContent = target.nama_target;
      $('#targetPagePercentBadge').textContent = Math.round(progress.persen) + '%';
      $('#laptopPercentText2').textContent = Math.round(progress.persen) + '%';
      $('#targetPageProgressFill').style.width = progress.persen + '%';
      $('#targetPageProgressBar').setAttribute('aria-valuenow', String(Math.round(progress.persen)));

      $('#targetPagePrice').textContent = formatRupiah(target.target_nominal);
      $('#targetPageCollected').textContent = formatRupiah(progress.saving);
      $('#targetPageRemaining').textContent = formatRupiah(progress.remaining);
      $('#targetPageEstimateText').textContent = formatEstimateText(estimate);

      const maxFillHeight = 68;
      const fillHeight = (progress.persen / 100) * maxFillHeight;
      const fillRect = $('#fillRect2');
      const fillWave = $('#fillWave2');
      const topY = 98 - fillHeight;

      requestAnimationFrame(() => {
        fillRect.setAttribute('y', String(topY));
        fillRect.setAttribute('height', String(fillHeight));
        fillWave.style.transform = 'translateY(' + (-fillHeight) + 'px)';
      });
    },

    init() {
      $('#targetEmptyAddBtn').addEventListener('click', () => TargetModal.open('add'));
      $('#openAddTargetBtn').addEventListener('click', () => TargetModal.open('add'));
      $('#editTargetBtn').addEventListener('click', () => TargetModal.open('edit'));

      $('#deleteTargetBtn').addEventListener('click', () => {
        if (!state.target) return;
        const target = state.target;
        ConfirmModal.open({
          title: 'Hapus target ini?',
          desc: '"' + target.nama_target + '" akan dihapus. Riwayat transaksi tabungan yang sudah tercatat tidak akan terhapus.',
          confirmLabel: 'Ya, Hapus Target',
          onConfirm: () => this.handleDelete(),
        });
      });
    },

    handleDelete() {
      state.target = null;
      Toast.show('Target berhasil dihapus', 'success');
      this.render();
      renderDashboard();
    },
  };

  /* ---------------------------------------------------------
     12. MODAL: TAMBAH / EDIT TARGET
  --------------------------------------------------------- */

  const TargetModal = {
    overlay: null,
    mode: 'add',

    init() {
      this.overlay = $('#targetModalOverlay');

      $('#targetModalClose').addEventListener('click', () => this.close());
      $('#targetModalCancel').addEventListener('click', () => this.close());
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });

      $('#targetForm').addEventListener('submit', (e) => this.handleSubmit(e));

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.overlay.classList.contains('is-open')) this.close();
      });
    },

    open(mode) {
      // Aturan backend: hanya boleh satu target ACTIVE. Jika sudah ada
      // target dan mode 'add' terpanggil secara tidak sengaja, alihkan ke edit.
      this.mode = (mode === 'add' && state.target) ? 'edit' : mode;

      this.clearErrors();
      const form = $('#targetForm');
      form.reset();

      if (this.mode === 'edit' && state.target) {
        $('#targetModalTitle').textContent = 'Edit Target';
        $('#targetFormNama').value = state.target.nama_target;
        $('#targetFormNominal').value = state.target.target_nominal;
      } else {
        $('#targetModalTitle').textContent = 'Tambah Target';
        $('#targetFormNama').value = '';
        $('#targetFormNominal').value = '';
      }

      this.overlay.hidden = false;
      requestAnimationFrame(() => this.overlay.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
    },

    close() {
      this.overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      setTimeout(() => { this.overlay.hidden = true; }, 220);
    },

    clearErrors() {
      ['errTargetNama', 'errTargetNominal'].forEach(id => {
        const el = $('#' + id);
        if (el) el.textContent = '';
      });
      $$('#targetForm input').forEach(el => el.classList.remove('has-error'));
    },

    setFieldError(errId, inputId, message) {
      $('#' + errId).textContent = message;
      const input = $('#' + inputId);
      if (input) input.classList.add('has-error');
    },

    /**
     * Validasi mengikuti aturan handleCreateTarget / handleUpdateTarget
     * di backend: nama_target tidak boleh kosong, target_nominal > 0.
     */
    validate(data) {
      this.clearErrors();
      let valid = true;

      if (!data.nama_target || data.nama_target.trim() === '') {
        this.setFieldError('errTargetNama', 'targetFormNama', 'Nama target tidak boleh kosong');
        valid = false;
      }

      const nominal = Number(data.target_nominal);
      if (data.target_nominal === '' || isNaN(nominal) || nominal <= 0) {
        this.setFieldError('errTargetNominal', 'targetFormNominal', 'Harga target harus lebih dari 0');
        valid = false;
      }

      return valid;
    },

    async handleSubmit(e) {
      e.preventDefault();

      const data = {
        nama_target: $('#targetFormNama').value,
        target_nominal: $('#targetFormNominal').value,
      };

      if (!this.validate(data)) return;

      const submitBtn = $('#targetModalSubmit');
      const isEdit = this.mode === 'edit' && state.target;

      this.setSubmitLoading(submitBtn, true);
      await delay(500); // simulasi round-trip API — akan diganti fetch() sungguhan di Tahap 6

      if (isEdit) {
        state.target.nama_target = data.nama_target.trim();
        state.target.target_nominal = Number(data.target_nominal);
      } else {
        state.target = {
          id: generateTargetId(),
          nama_target: data.nama_target.trim(),
          target_nominal: Number(data.target_nominal),
          tanggal_mulai: TODAY,
          status: 'ACTIVE',
        };
      }

      this.setSubmitLoading(submitBtn, false);
      this.close();

      Toast.show(isEdit ? 'Target berhasil diubah' : 'Target berhasil dibuat', 'success');

      TargetPage.render();
      renderDashboard();
    },

    setSubmitLoading(btn, loading) {
      btn.disabled = loading;
      btn.querySelector('.btn-label').textContent = loading ? 'Menyimpan...' : 'Simpan Target';
      $('#targetModalSpinner').hidden = !loading;
    },
  };

  /* ---------------------------------------------------------
     13. MISC: hero balance eye toggle
  --------------------------------------------------------- */

  function initHeroBalanceToggle() {
    $('#toggleBalanceVisibility').addEventListener('click', () => {
      balanceVisible = !balanceVisible;
      const icon = $('#toggleBalanceVisibility').querySelector('i');
      icon.className = balanceVisible ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
      renderHeroBalance();
    });
  }

  /* ---------------------------------------------------------
     14. INIT
  --------------------------------------------------------- */

  function init() {
    ThemeManager.init();
    renderGreeting();
    initHeroBalanceToggle();
    renderDashboard();
    renderLevelCard();
    renderSummaryBars();
    renderAchievementStrip();

    Router.init();
    TxPage.init();
    TxModal.init();
    ConfirmModal.init();
    TargetPage.init();
    TargetModal.init();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
