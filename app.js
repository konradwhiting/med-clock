/* med-clock: supply countdown. All medicine data lives in the browser (localStorage) only. */
(function (root) {
  var KEY = 'medclock.v1';

  function dayNumber(d) { // whole calendar days, local time
    return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000 + 0.5);
  }
  function parseDate(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtDate(d) {
    var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + m[d.getMonth()];
  }
  function isoDate(d) {
    function z(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }

  // Work out the current state of one medicine as of `now`.
  function compute(med, now) {
    var counted = Number(med.counted);
    var perDay = Number(med.perDay) || 0;
    var elapsed = Math.max(0, dayNumber(now) - dayNumber(parseDate(med.countDate)));
    var left = Math.max(0, counted - perDay * elapsed);
    var out = { name: med.name, unit: med.unit || '', left: left, perDay: perDay, note: med.note || '', daysLeft: null, runOut: null };
    if (perDay > 0) {
      out.daysLeft = Math.floor(left / perDay + 1e-9);
      var r = new Date(now.getFullYear(), now.getMonth(), now.getDate() + out.daysLeft);
      out.runOut = r;
    }
    return out;
  }

  function sortRows(rows) {
    return rows.slice().sort(function (a, b) {
      var x = a.daysLeft === null ? 9999 : a.daysLeft, y = b.daysLeft === null ? 9999 : b.daysLeft;
      return x - y || a.name.localeCompare(b.name);
    });
  }
  function level(daysLeft) {
    if (daysLeft === null) return 'none';
    if (daysLeft <= 3) return 'red';
    if (daysLeft <= 7) return 'amber';
    if (daysLeft <= 14) return 'yellow';
    return 'green';
  }

  var api = { compute: compute, sortRows: sortRows, level: level, dayNumber: dayNumber, parseDate: parseDate, fmtDate: fmtDate, isoDate: isoDate, KEY: KEY };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  root.MedClock = api;
})(typeof window !== 'undefined' ? window : this);
