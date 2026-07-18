/*
  app.js
  Entry point: DOM references, event listeners, rendering.
  Ties storage.js, quotes.js, and statistics.js together.
*/

document.addEventListener('DOMContentLoaded', () => {
  const amountInput = document.getElementById('amount-input');
  const saveBtn = document.getElementById('save-btn');
  const mascotEl = document.querySelector('.mascot');
  const quoteCard = document.getElementById('quote-card');
  const quoteText = document.getElementById('quote-text');
  const historyList = document.getElementById('history-list');

  const reduceMotion = typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CONFETTI_COLORS = ['#e8a33c', '#f3efe8', '#c97f22'];

  function spawnConfetti(anchorEl) {
    if (reduceMotion) return;

    const rect = anchorEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < 14; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';

      const dx = (Math.random() - 0.5) * 160;
      const rise = -(30 + Math.random() * 30);
      const fall = 100 + Math.random() * 60;
      const r = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 180);

      piece.style.setProperty('--dx', `${dx}px`);
      piece.style.setProperty('--rise', `${rise}px`);
      piece.style.setProperty('--fall', `${fall}px`);
      piece.style.setProperty('--r', `${r}deg`);
      piece.style.left = `${originX}px`;
      piece.style.top = `${originY}px`;
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      piece.style.animationDelay = `${Math.random() * 60}ms`;

      document.body.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
      setTimeout(() => piece.remove(), 1000); // safety net
    }
  }

  function celebrate() {
    if (reduceMotion) return;

    saveBtn.classList.add('celebrate');
    if (mascotEl) mascotEl.classList.add('celebrate');
    spawnConfetti(saveBtn);

    setTimeout(() => {
      saveBtn.classList.remove('celebrate');
      if (mascotEl) mascotEl.classList.remove('celebrate');
    }, 650);
  }

  const statEls = {
    total: document.getElementById('stat-total'),
    today: document.getElementById('stat-today'),
    best: document.getElementById('stat-best'),
    victories: document.getElementById('stat-victories'),
    week: document.getElementById('stat-week'),
    month: document.getElementById('stat-month')
  };

  function formatAmount(n) {
    return n.toFixed(3) + ' د.ت';
  }

  function formatDisplayDate(dateStr, timeStr) {
    const [, m, d] = dateStr.split('-');
    return `${d}/${m} · ${timeStr}`;
  }

  function renderStats() {
    const records = Storage.getRecords();
    const stats = Statistics.compute(records);

    statEls.total.textContent = formatAmount(stats.total);
    statEls.today.textContent = formatAmount(stats.today);
    statEls.best.textContent = formatAmount(stats.best);
    statEls.victories.textContent = String(stats.victories);
    statEls.week.textContent = `${formatAmount(stats.week.amount)} · ${stats.week.count}`;
    statEls.month.textContent = `${formatAmount(stats.month.amount)} · ${stats.month.count}`;
  }

  function renderHistory() {
    const records = Storage.getRecords().slice().reverse(); // newest first
    historyList.innerHTML = '';

    if (records.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'history-empty';
      empty.textContent = 'مازال ما فماش توفير مسجّل. ابدا اليوم 🌱';
      historyList.appendChild(empty);
      return;
    }

    records.forEach(r => {
      const li = document.createElement('li');
      li.className = 'history-item';

      const top = document.createElement('div');
      top.className = 'history-item-top';

      const amountEl = document.createElement('span');
      amountEl.className = 'history-amount';
      amountEl.textContent = formatAmount(r.amount);

      const metaEl = document.createElement('span');
      metaEl.className = 'history-meta';
      metaEl.textContent = formatDisplayDate(r.date, r.time);

      top.appendChild(amountEl);
      top.appendChild(metaEl);

      const quoteEl = document.createElement('div');
      quoteEl.className = 'history-quote';
      quoteEl.textContent = r.quote;

      li.appendChild(top);
      li.appendChild(quoteEl);
      historyList.appendChild(li);
    });
  }

  function handleSave() {
    const raw = amountInput.value;
    if (raw === '') {
      amountInput.focus();
      return;
    }

    const amount = parseFloat(raw);
    if (isNaN(amount) || amount < 0) {
      amountInput.focus();
      return;
    }

    const quote = Quotes.pick(amount);
    Storage.addRecord(amount, quote);

    quoteText.textContent = quote;
    quoteCard.hidden = false;
    celebrate();

    amountInput.value = '';

    renderStats();
    renderHistory();
  }

  saveBtn.addEventListener('click', handleSave);
  amountInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  });

  renderStats();
  renderHistory();
});
