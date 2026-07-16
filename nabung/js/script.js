/* ============================================================
   NABUNG UNTUK MASA DEPAN — script.js
   TAHAP 1: Dummy data only. Struktur data sengaja dibuat
   sudah mirip response backend (lihat 00_Config.gs) supaya
   integrasi API di Tahap 6 tinggal ganti sumber data, bukan
   ganti struktur.
   ============================================================ */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. DUMMY DATA
     (Bentuk field mengikuti handleGetDashboard / handleAddTransaction
      / handleGetAchievements di backend Google Apps Script)
  --------------------------------------------------------- */

  const DUMMY = {
    user: {
      nama: 'Fajar',
    },

    target: {
      id: '1',
      nama_target: 'ASUS TUF Gaming A15',
      target_nominal: 20000000,
      total_saving: 8450000,
      kurang: 11550000,
      persen: 42.25,
      prediksi_selesai: '2026-10-28',
    },

    summary_today: { income: 0, expense: 25000, saving: 50000 },

    summary_30days: {
      total_income: 2100000,
      total_expense: 860000,
      total_saving: 1240000,
    },

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

    transactions: [
      { id: 't1', tanggal: '2026-07-16', tipe: 'SAVING',  kategori: 'Tabungan Laptop', nominal: 50000,  keterangan: 'Nabung harian' },
      { id: 't2', tanggal: '2026-07-15', tipe: 'EXPENSE', kategori: 'Makanan',         nominal: 25000,  keterangan: 'Makan siang' },
      { id: 't3', tanggal: '2026-07-15', tipe: 'INCOME',  kategori: 'Uang Saku',       nominal: 300000, keterangan: 'Uang saku mingguan' },
      { id: 't4', tanggal: '2026-07-14', tipe: 'SAVING',  kategori: 'Tabungan Laptop', nominal: 75000,  keterangan: 'Sisa jajan' },
      { id: 't5', tanggal: '2026-07-13', tipe: 'EXPENSE', kategori: 'Transportasi',    nominal: 15000,  keterangan: 'Ongkos angkot' },
      { id: 't6', tanggal: '2026-07-12', tipe: 'SAVING',  kategori: 'Tabungan Laptop', nominal: 100000, keterangan: 'Bonus tugas' },
    ],

    // chart_30days-like, dipangkas jadi 14 titik untuk ringkasan mini
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

    // subset achievement, field sama seperti handleGetAchievements
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
  };

  /* ---------------------------------------------------------
     2. UTILITIES
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
    const today = new Date('2026-07-16');
    const d = new Date(dateStr);
    const diffMs = today - d;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    return diffDays + ' hari lalu';
  }

  function greetingByHour() {
    const h = new Date().getHours();
    if (h < 10) return 'Selamat pagi,';
    if (h < 15) return 'Selamat siang,';
    if (h < 18) return 'Selamat sore,';
    return 'Selamat malam,';
  }

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ---------------------------------------------------------
     3. THEME (dark / light) — persisted via in-memory + localStorage
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
     4. RENDER: Header / greeting
  --------------------------------------------------------- */

  function renderGreeting() {
    $('#greetingLabel').textContent = greetingByHour();
    $('#greetingName').textContent = DUMMY.user.nama + ' 👋';
    $('#navLevelText').textContent = 'Lv ' + DUMMY.level.level;
  }

  /* ---------------------------------------------------------
     5. RENDER: Hero balance
  --------------------------------------------------------- */

  let balanceVisible = true;

  function computeBalance() {
    return DUMMY.summary_30days.total_income - DUMMY.summary_30days.total_expense;
  }

  function renderHeroBalance() {
    const balance = computeBalance();
    $('#totalBalance').textContent = formatRupiah(balance);
    $('#totalIncome').textContent = formatRupiah(DUMMY.summary_30days.total_income);
    $('#totalExpense').textContent = formatRupiah(DUMMY.summary_30days.total_expense);

    $('#toggleBalanceVisibility').addEventListener('click', () => {
      balanceVisible = !balanceVisible;
      const icon = $('#toggleBalanceVisibility').querySelector('i');
      if (balanceVisible) {
        $('#totalBalance').textContent = formatRupiah(balance);
        icon.className = 'fa-regular fa-eye';
      } else {
        $('#totalBalance').textContent = 'Rp••••••••';
        icon.className = 'fa-regular fa-eye-slash';
      }
    });
  }

  /* ---------------------------------------------------------
     6. RENDER: Stat cards
  --------------------------------------------------------- */

  function renderStatCards() {
    $('#statSavingValue').textContent = formatRupiah(DUMMY.target.total_saving);
    $('#statSavingValue').nextElementSibling.textContent =
      Math.round(DUMMY.target.persen) + '% dari target laptop';

    $('#statStreakValue').textContent = DUMMY.streak + ' Hari';
    $('#statXpValue').textContent = DUMMY.level.total_xp.toLocaleString('id-ID') + ' XP';
    $('#statXpValue').nextElementSibling.textContent =
      'Level ' + DUMMY.level.level + ' · ' + DUMMY.level.nama;
  }

  /* ---------------------------------------------------------
     7. RENDER: Target card (signature laptop-fill)
  --------------------------------------------------------- */

  function renderTargetCard() {
    const t = DUMMY.target;
    const persen = Math.min(100, Math.round(t.persen * 100) / 100);

    $('#targetName').textContent = t.nama_target;
    $('#targetPercentBadge').textContent = Math.round(persen) + '%';
    $('#laptopPercentText').textContent = Math.round(persen) + '%';
    $('#targetProgressFill').style.width = persen + '%';
    $('.target-progress-bar').setAttribute('aria-valuenow', String(Math.round(persen)));

    $('#targetCollected').textContent = formatRupiah(t.total_saving);
    $('#targetRemaining').textContent = formatRupiah(t.kurang);
    $('#targetEstimate').textContent = formatTanggalPendek(t.prediksi_selesai);

    // Animate the SVG liquid fill (screen inner area ~ y:20..90, height 70)
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

  /* ---------------------------------------------------------
     8. RENDER: Level / XP card
  --------------------------------------------------------- */

  function renderLevelCard() {
    const l = DUMMY.level;
    $('#levelBadgeIcon').textContent = l.icon;
    $('#levelCardName').textContent = l.nama;
    $('#levelCurrentXp').textContent = l.total_xp.toLocaleString('id-ID');
    $('#levelNextXp').textContent = l.xp_next.toLocaleString('id-ID');
    $('#levelNextName').textContent = l.next_nama || '-';
    $('#xpBarFill').style.width = l.progress_persen + '%';
  }

  /* ---------------------------------------------------------
     9. RENDER: Monthly summary mini bars
  --------------------------------------------------------- */

  function renderSummaryBars() {
    const container = $('#summaryBars');
    container.innerHTML = '';

    const days = DUMMY.chart_days;
    const maxVal = Math.max(
      ...days.map(d => Math.max(d.income, d.expense, d.saving)),
      1
    );
    const maxBarHeight = 100; // px

    days.forEach(d => {
      const group = document.createElement('div');
      group.className = 'summary-bar-group';

      [
        ['income', d.income],
        ['expense', d.expense],
        ['saving', d.saving],
      ].forEach(([key, val]) => {
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

  /* ---------------------------------------------------------
     10. RENDER: Recent transactions
  --------------------------------------------------------- */

  const TX_ICON = {
    INCOME:  { icon: 'fa-solid fa-arrow-down', cls: 'tx-icon--income' },
    EXPENSE: { icon: 'fa-solid fa-arrow-up',   cls: 'tx-icon--expense' },
    SAVING:  { icon: 'fa-solid fa-piggy-bank', cls: 'tx-icon--saving' },
    WITHDRAWAL: { icon: 'fa-solid fa-rotate-left', cls: 'tx-icon--expense' },
  };

  function renderTxList() {
    const list = $('#txList');
    list.innerHTML = '';

    DUMMY.transactions.forEach(tx => {
      const meta = TX_ICON[tx.tipe] || TX_ICON.EXPENSE;
      const sign = tx.tipe === 'EXPENSE' || tx.tipe === 'WITHDRAWAL' ? '-' : '+';
      const amountClass = tx.tipe === 'INCOME' ? 'income' : (tx.tipe === 'SAVING' ? 'saving' : 'expense');

      const li = document.createElement('li');
      li.className = 'tx-item';
      li.innerHTML = `
        <div class="tx-icon ${meta.cls}"><i class="${meta.icon}"></i></div>
        <div class="tx-info">
          <p class="tx-title">${tx.keterangan || tx.kategori}</p>
          <p class="tx-meta">${tx.kategori} · ${relativeTanggal(tx.tanggal)}</p>
        </div>
        <div class="tx-amount ${amountClass}">${sign}${formatRupiah(tx.nominal)}</div>
      `;
      list.appendChild(li);
    });
  }

  /* ---------------------------------------------------------
     11. RENDER: Achievement teaser strip
  --------------------------------------------------------- */

  function renderAchievementStrip() {
    const strip = $('#achievementStrip');
    strip.innerHTML = '';

    DUMMY.achievements.forEach(a => {
      const item = document.createElement('div');
      item.className = 'badge-item';
      item.setAttribute('data-rarity', a.rarity);
      item.innerHTML = `
        <div class="badge-circle ${a.is_unlocked ? '' : 'is-locked'}">${a.is_unlocked ? a.icon : '🔒'}</div>
        <p class="badge-name">${a.is_unlocked ? a.nama : '???'}</p>
      `;
      strip.appendChild(item);
    });

    $('#achievementCountChip').textContent =
      DUMMY.unlocked_achievements + ' / ' + DUMMY.total_achievements;
  }

  /* ---------------------------------------------------------
     12. NAV: active state (Tahap 1 hanya visual, tanpa routing)
  --------------------------------------------------------- */

  function initNavActiveState() {
    const allNavLinks = $$('.sidebar-link, .bottom-nav-link');
    allNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');

        $$('.sidebar-link').forEach(l => l.classList.toggle(
          'is-active', l.getAttribute('data-page') === page
        ));
        $$('.bottom-nav-link').forEach(l => l.classList.toggle(
          'is-active', l.getAttribute('data-page') === page
        ));
      });
    });
  }

  /* ---------------------------------------------------------
     13. INIT
  --------------------------------------------------------- */

  function init() {
    ThemeManager.init();
    renderGreeting();
    renderHeroBalance();
    renderStatCards();
    renderTargetCard();
    renderLevelCard();
    renderSummaryBars();
    renderTxList();
    renderAchievementStrip();
    initNavActiveState();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
