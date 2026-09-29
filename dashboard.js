/* Dashboard — PROJECT 01
 * Alur: DashboardData.load() -> normalisasi -> render per komponen.
 * Untuk integrasi API nanti, cukup ganti isi DashboardData.load().
 */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const TYPE_LABEL = { INCOME:'Pemasukan', EXPENSE:'Pengeluaran', SAVING:'Menabung', WITHDRAWAL:'Tarik tabungan' };

  /* ---------- Format ---------- */
  const Fmt = {
    rp: (n) => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID'),
    key: (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'),
    dateLong: (s) => {
      if (!s) return null;
      const [y, m, d] = s.split('-').map(Number);
      return d + ' ' + MONTHS[m - 1] + ' ' + y;
    },
  };

  /* ---------- Data layer ----------
   * Bentuk data mengikuti respons backend yang sudah ada (action getDashboard:
   * target, summary_today, chart_30days, saving_dates, quote).
   * Field `total` (tunai/e-wallet) dan `summary_month` BELUM ada di
   * getDashboard, jadi sementara berisi mock.
   */
  const DashboardData = {
    async load() {
      return buildMock();
    },
  };

  function buildMock() {
    const today = new Date();
    const chart = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      chart.push({
        tanggal: Fmt.key(d),
        income:  rnd() > 0.72 ? Math.round(rnd() * 400 + 100) * 1000 : 0,
        expense: rnd() > 0.35 ? Math.round(rnd() * 90 + 10) * 1000 : 0,
        saving:  rnd() > 0.5  ? Math.round(rnd() * 50 + 10) * 1000 : 0,
      });
    }
    const last = chart[chart.length - 1];
    const monthKey = Fmt.key(today).slice(0, 7);
    const inMonth = chart.filter(d => d.tanggal.startsWith(monthKey));
    return {
      quote: { quote: 'Receh hari ini, laptop besok.', author: 'Anonim' },
      total: { cash: 1250000, ewallet: 830000 },
      target: {
        nama_target: 'ASUS TUF Gaming A15', target_nominal: 20000000, total_saving: 6400000,
        persen: 32, status: 'ACTIVE', prediksi_selesai: Fmt.key(new Date(today.getFullYear(), today.getMonth() + 8, 15)),
      },
      summary_today: { income: last.income, expense: last.expense },
      summary_month: {
        income:  inMonth.reduce((s, d) => s + d.income, 0),
        expense: inMonth.reduce((s, d) => s + d.expense, 0),
      },
      chart_30days: chart,
      saving_dates: chart.filter(d => d.saving > 0).map(d => d.tanggal),
    };
  }

  /* ---------- Komponen ---------- */
  const Quote = {
    render(q) {
      $('quoteText').textContent = q ? '“' + q.quote + '”' : 'Tetap semangat menabung!';
      $('quoteAuthor').textContent = q && q.author ? q.author : '';
    },
  };

  const Total = {
    render(t) {
      t = t || { cash: 0, ewallet: 0 };
      $('totalValue').textContent = Fmt.rp(t.cash + t.ewallet);
      $('totalCash').textContent = Fmt.rp(t.cash);
      $('totalEwallet').textContent = Fmt.rp(t.ewallet);
    },
  };

  const Wishlist = {
    render(t) {
      if (!t) {
        $('wishName').textContent = 'Belum ada wishlist aktif';
        $('wishStatus').textContent = 'Kosong';
        ['wishSaved','wishTarget','wishPercent','wishPredict'].forEach(id => $(id).textContent = '-');
        $('wishFill').style.width = '0';
        return;
      }
      const pct = Math.max(0, Math.min(100, Number(t.persen) || 0));
      $('wishName').textContent = t.nama_target;
      $('wishSaved').textContent = Fmt.rp(t.total_saving);
      $('wishTarget').textContent = Fmt.rp(t.target_nominal);
      $('wishPercent').textContent = pct.toFixed(1).replace('.', ',') + '%';
      $('wishPredict').textContent = Fmt.dateLong(t.prediksi_selesai) || 'Belum bisa diprediksi';
      $('wishBar').setAttribute('aria-valuenow', pct);
      requestAnimationFrame(() => { $('wishFill').style.width = pct + '%'; });

      const badge = $('wishStatus');
      let cls = 'badge--active', text = 'Sedang berjalan';
      if (t.status === 'COMPLETED') { cls = 'badge--done'; text = 'Tercapai'; }
      else if (!t.prediksi_selesai) { cls = 'badge--warn'; text = 'Butuh tabungan'; }
      badge.className = 'badge ' + cls;
      badge.textContent = text;
    },
  };

  const Summary = {
    render(today, month) {
      today = today || {}; month = month || {};
      $('sumInToday').textContent = Fmt.rp(today.income);
      $('sumOutToday').textContent = Fmt.rp(today.expense);
      $('sumInMonth').textContent = Fmt.rp(month.income);
      $('sumOutMonth').textContent = Fmt.rp(month.expense);
    },
  };

  const Chart = {
    days: [], range: 30,
    init(days) {
      this.days = days || [];
      document.querySelectorAll('.seg__btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.range = Number(btn.dataset.range);
          document.querySelectorAll('.seg__btn').forEach(b => b.classList.toggle('is-active', b === btn));
          this.render();
        });
      });
      this.render();
    },
    render() {
      const el = $('chartArea');
      const data = this.days.slice(-this.range);
      const max = Math.max(0, ...data.map(d => Math.max(d.income, d.expense)));
      if (!data.length || max === 0) { el.innerHTML = '<p class="empty">Belum ada aktivitas pada rentang ini.</p>'; return; }

      const W = 600, H = 240, L = 44, R = 8, T = 8, B = 24;
      const iw = W - L - R, ih = H - T - B, step = iw / data.length;
      const bw = Math.max(2, Math.min(14, step * 0.36));
      const y = (v) => T + ih - (v / max) * ih;
      const NS = 'http://www.w3.org/2000/svg';
      let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik pemasukan dan pengeluaran">';
      for (let i = 0; i <= 4; i++) {
        const v = (max / 4) * i, yy = y(v);
        s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '"/>' +
             '<text class="axis" x="' + (L - 6) + '" y="' + (yy + 3) + '" text-anchor="end">' + short(v) + '</text>';
      }
      const every = data.length > 14 ? 5 : 1;
      data.forEach((d, i) => {
        const cx = L + step * i + step / 2;
        s += '<rect class="bar-in" rx="2" x="' + (cx - bw - 1) + '" y="' + y(d.income) + '" width="' + bw + '" height="' + (T + ih - y(d.income)) + '"><title>' + d.tanggal + ' · Masuk ' + Fmt.rp(d.income) + '</title></rect>' +
             '<rect class="bar-out" rx="2" x="' + (cx + 1) + '" y="' + y(d.expense) + '" width="' + bw + '" height="' + (T + ih - y(d.expense)) + '"><title>' + d.tanggal + ' · Keluar ' + Fmt.rp(d.expense) + '</title></rect>';
        if (i % every === 0) s += '<text class="axis" x="' + cx + '" y="' + (H - 6) + '" text-anchor="middle">' + Number(d.tanggal.slice(8)) + '</text>';
      });
      el.innerHTML = s + '</svg>';
      void NS;
    },
  };
  function short(v) {
    if (v >= 1e6) return (v / 1e6).toFixed(1).replace('.0', '') + ' jt';
    if (v >= 1e3) return Math.round(v / 1e3) + ' rb';
    return String(Math.round(v));
  }

  const Calendar = {
    activity: {}, view: new Date(),
    init(chartDays, savingDates) {
      // Peta tanggal -> jenis aktivitas
      const a = {};
      (chartDays || []).forEach(d => {
        const f = a[d.tanggal] = a[d.tanggal] || {};
        if (d.income > 0) f.in = true;
        if (d.expense > 0) f.out = true;
        if (d.saving > 0) f.sav = true;
      });
      (savingDates || []).forEach(k => { (a[k] = a[k] || {}).sav = true; });
      this.activity = a;
      this.view = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      $('calPrev').addEventListener('click', () => this.shift(-1));
      $('calNext').addEventListener('click', () => this.shift(1));
      this.render();
    },
    shift(n) { this.view = new Date(this.view.getFullYear(), this.view.getMonth() + n, 1); this.render(); },
    render() {
      const y = this.view.getFullYear(), m = this.view.getMonth();
      $('calMonth').textContent = MONTHS[m] + ' ' + y;
      const first = (new Date(y, m, 1).getDay() + 6) % 7; // Senin = 0
      const days = new Date(y, m + 1, 0).getDate();
      const todayKey = Fmt.key(new Date());
      let h = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d => '<div class="cal__dow">' + d + '</div>').join('');
      for (let i = 0; i < first; i++) h += '<div></div>';
      for (let d = 1; d <= days; d++) {
        const key = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        const act = this.activity[key];
        const dots = act ? (act.in ? '<i class="in"></i>' : '') + (act.out ? '<i class="out"></i>' : '') + (act.sav ? '<i class="sav"></i>' : '') : '';
        h += '<div class="cal__day' + (act ? ' has' : '') + (key === todayKey ? ' today' : '') + '">' + d + '<span class="cal__dots">' + dots + '</span></div>';
      }
      $('calGrid').innerHTML = h;
    },
  };

  const AddButton = {
    init() {
      const fab = $('fab'), btn = $('fabBtn'), menu = $('fabMenu');
      const set = (open) => { menu.hidden = !open; fab.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open); };
      btn.addEventListener('click', () => set(menu.hidden));
      document.addEventListener('click', (e) => { if (!fab.contains(e.target)) set(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
      menu.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-type]');
        if (!b) return;
        set(false);
        // Hook untuk project Transaksi: dengarkan event ini.
        document.dispatchEvent(new CustomEvent('dashboard:add', { detail: { type: b.dataset.type } }));
        toast('Form ' + TYPE_LABEL[b.dataset.type].toLowerCase() + ' tersedia di project Transaksi.');
      });
    },
  };

  let toastTimer;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------- Init ---------- */
  async function init() {
    AddButton.init();
    try {
      const d = await DashboardData.load();
      Quote.render(d.quote);
      Total.render(d.total);
      Wishlist.render(d.target);
      Summary.render(d.summary_today, d.summary_month);
      Chart.init(d.chart_30days);
      Calendar.init(d.chart_30days, d.saving_dates);
    } catch (err) {
      toast('Gagal memuat dashboard. Coba muat ulang halaman.');
    }
  }
  document.addEventListener('DOMContentLoaded', init);
})();
