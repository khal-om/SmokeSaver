/*
  statistics.js
  Computes total / today / best / victories / weekly / monthly summaries
  from the records returned by storage.js.
*/

const Statistics = (() => {
  function parseLocalDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function todayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function isThisWeek(dateStr) {
    const d = parseLocalDate(dateStr);
    const now = new Date();
    const dayIndex = (now.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayIndex);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59, 999);
    return d >= monday && d <= sunday;
  }

  function isThisMonth(dateStr) {
    const d = parseLocalDate(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }

  function compute(records) {
    const total = records.reduce((sum, r) => sum + r.amount, 0);

    const today = records
      .filter(r => r.date === todayString())
      .reduce((sum, r) => sum + r.amount, 0);

    const best = records.reduce((max, r) => Math.max(max, r.amount), 0);
    const victories = records.length;

    const weekRecords = records.filter(r => isThisWeek(r.date));
    const monthRecords = records.filter(r => isThisMonth(r.date));

    return {
      total,
      today,
      best,
      victories,
      week: {
        amount: weekRecords.reduce((sum, r) => sum + r.amount, 0),
        count: weekRecords.length
      },
      month: {
        amount: monthRecords.reduce((sum, r) => sum + r.amount, 0),
        count: monthRecords.length
      }
    };
  }

  return { compute };
})();
