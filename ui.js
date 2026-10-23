(function () {
  var M = window.MedClock;
  var $ = function (id) { return document.getElementById(id); };
  var meds = [];

  function load() {
    try { meds = JSON.parse(localStorage.getItem(M.KEY) || '[]'); } catch (e) { meds = []; }
    if (!Array.isArray(meds)) meds = [];
  }
  function save() { try { localStorage.setItem(M.KEY, JSON.stringify(meds)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function tick() {
    var n = new Date();
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    $('day').textContent = days[n.getDay()];
    $('date').textContent = n.getDate() + ' ' + months[n.getMonth()];
  }

  function render() {
    var now = new Date();
    var rows = M.sortRows(meds.map(function (m) { return M.compute(m, now); }));
    var html = '';
    if (!rows.length) html = '<p class="empty">No medicines yet. Tap Edit, then Import to paste your data.</p>';
    rows.forEach(function (r) {
      var lvl = M.level(r.daysLeft);
      var big = r.daysLeft === null ? '–' : r.daysLeft;
      var sub = r.daysLeft === null ? 'as needed' : (r.daysLeft === 1 ? 'day left' : 'days left');
      var fl = Math.floor(r.left), unit = r.unit && fl === 1 ? r.unit.replace(/s$/, '') : r.unit;
      var left = fl + (unit ? ' ' + esc(unit) : '');
      var run = r.runOut ? 'out ' + M.fmtDate(r.runOut) : '';
      html += '<div class="row ' + lvl + '"><div class="days"><b>' + big + '</b><span>' + sub + '</span></div>' +
        '<div class="info"><div class="name">' + esc(r.name) + '</div><div class="meta">' + left + (run ? ' · ' + run : '') + '</div></div></div>';
    });
    // Two columns, filled top to bottom: at least 5 rows so the cards stay a sensible size.
    $('list').style.gridTemplateRows = 'repeat(' + Math.max(5, Math.ceil(rows.length / 2)) + ', minmax(0, 1fr))';
    $('list').innerHTML = html;
    var d = $('editlist'); if (!d) return;
    var e = '';
    meds.forEach(function (m, i) {
      e += '<div class="erow"><span class="en">' + esc(m.name) + '</span>' +
        '<label>Counted <input data-i="' + i + '" data-k="counted" type="number" value="' + esc(m.counted) + '"></label>' +
        '<label>On <input data-i="' + i + '" data-k="countDate" type="date" value="' + esc(m.countDate) + '"></label>' +
        '<label>Per day <input data-i="' + i + '" data-k="perDay" type="number" step="any" value="' + esc(m.perDay || 0) + '"></label>' +
        '<label>New supply <input data-r="' + i + '" type="number" step="any" placeholder="how many"></label>' +
        '<button data-restock="' + i + '">Add supply</button>' +
        '<button data-del="' + i + '">Remove</button></div>';
    });
    d.innerHTML = e;
  }

  function openEdit(on) { $('edit').style.display = on ? 'block' : 'none'; if (on) render(); }

  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (t.id === 'editBtn') openEdit($('edit').style.display !== 'block');
    if (t.id === 'doneBtn') openEdit(false);
    if (t.id === 'fsBtn') { var el = document.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el); }
    if (t.getAttribute && t.getAttribute('data-del') !== null) {
      var di = +t.getAttribute('data-del');
      if (confirm('Remove ' + meds[di].name + '?')) { meds.splice(di, 1); save(); render(); }
    }
    if (t.getAttribute && t.getAttribute('data-restock') !== null) {
      // New repeat arrived: count what is left today, add the new supply, restart the count from today.
      var ri = +t.getAttribute('data-restock'), box = document.querySelector('input[data-r="' + ri + '"]');
      var qty = box ? parseFloat(box.value) : NaN;
      if (!(qty > 0)) { $('msg').textContent = 'Type how many you received, then tap Add supply.'; return; }
      var now = new Date(), cur = M.compute(meds[ri], now).left;
      meds[ri].counted = Math.round((cur + qty) * 100) / 100;
      meds[ri].countDate = M.isoDate(now);
      save(); $('msg').textContent = 'Added ' + qty + ' to ' + meds[ri].name + '.'; render();
    }
    if (t.id === 'importBtn') {
      try {
        var data = JSON.parse($('json').value);
        if (!Array.isArray(data)) throw new Error('not a list');
        meds = data; save(); $('json').value = ''; $('msg').textContent = 'Imported ' + data.length + ' medicines.'; render();
      } catch (e) { $('msg').textContent = 'That did not look like the data file. Paste it exactly as given.'; }
    }
    if (t.id === 'exportBtn') { $('json').value = JSON.stringify(meds, null, 1); $('msg').textContent = 'Copy this text to keep a backup.'; }
    if (t.id === 'addBtn') {
      var n = $('newName').value.trim(); if (!n) return;
      meds.push({ name: n, unit: $('newUnit').value.trim(), counted: +$('newCount').value || 0, countDate: M.isoDate(new Date()), perDay: +$('newPer').value || 0 });
      save(); ['newName','newUnit','newCount','newPer'].forEach(function (i) { $(i).value = ''; }); render();
    }
  });
  document.addEventListener('change', function (ev) {
    var t = ev.target, i = t.getAttribute && t.getAttribute('data-i');
    if (i === null || i === undefined) return;
    var k = t.getAttribute('data-k'); meds[+i][k] = (k === 'countDate') ? t.value : Number(t.value); save();
  });

  load(); tick(); render();
  setInterval(tick, 30000);
  setInterval(function () { if ($('edit').style.display !== 'block') render(); }, 60000);
})();
