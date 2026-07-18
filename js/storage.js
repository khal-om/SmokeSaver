/*
  storage.js
  Owns every LocalStorage read/write for saving records.
  Each record: { id, amount, date: "YYYY-MM-DD", time: "HH:MM", quote }
  Records are never overwritten — every save appends a new entry.
*/

const Storage = (() => {
  const KEY = 'tawfira_records';

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function formatDate(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function formatTime(d) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function getRecords() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Tawfira: failed to read records', e);
      return [];
    }
  }

  function saveRecords(records) {
    try {
      localStorage.setItem(KEY, JSON.stringify(records));
      return true;
    } catch (e) {
      console.error('Tawfira: failed to save records', e);
      return false;
    }
  }

  function addRecord(amount, quote) {
    const now = new Date();
    const record = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      amount: amount,
      date: formatDate(now),
      time: formatTime(now),
      quote: quote
    };
    const records = getRecords();
    records.push(record);
    saveRecords(records);
    return record;
  }

  function clearToday() {
    const today = formatDate(new Date());
    const remaining = getRecords().filter(r => r.date !== today);
    saveRecords(remaining);
    return remaining;
  }

  return { getRecords, addRecord, clearToday };

})();