/* f1-records.js — progressive column sorting for the static record tables.
 * The table is fully rendered server-side; this only reorders existing rows on
 * header click. No framework. Safe to no-op if JS is disabled. */
(function () {
  function enhance(table) {
    var tbody = table.tBodies[0];
    var head = table.tHead && table.tHead.rows[0];
    if (!tbody || !head) return;
    var headers = head.cells;
    var state = { key: null, dir: 1 };

    function sortBy(th) {
      var key = th.getAttribute("data-sort");
      var type = th.getAttribute("data-type") || "text";
      // toggle if same column; new column defaults: value -> desc, others -> asc
      var dir = state.key === key ? -state.dir : key === "value" ? -1 : 1;
      state = { key: key, dir: dir };

      var rows = Array.prototype.slice.call(tbody.rows);
      rows.sort(function (a, b) {
        var av = a.getAttribute("data-" + key), bv = b.getAttribute("data-" + key);
        if (type === "num") { av = parseFloat(av); bv = parseFloat(bv); if (isNaN(av)) av = 0; if (isNaN(bv)) bv = 0; }
        else { av = (av || "").toLowerCase(); bv = (bv || "").toLowerCase(); }
        if (av < bv) return -dir;
        if (av > bv) return dir;
        return (parseFloat(a.getAttribute("data-rank")) || 0) - (parseFloat(b.getAttribute("data-rank")) || 0);
      });
      var frag = document.createDocumentFragment();
      rows.forEach(function (r) { frag.appendChild(r); });
      tbody.appendChild(frag);

      for (var i = 0; i < headers.length; i++) headers[i].removeAttribute("aria-sort");
      th.setAttribute("aria-sort", dir === 1 ? "ascending" : "descending");
    }

    Array.prototype.forEach.call(headers, function (th) {
      if (!th.getAttribute("data-sort")) return;
      th.setAttribute("tabindex", "0");
      th.setAttribute("role", "button");
      th.addEventListener("click", function () { sortBy(th); });
      th.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sortBy(th); }
      });
    });
  }

  function init() {
    var tables = document.querySelectorAll("[data-record-table]");
    Array.prototype.forEach.call(tables, enhance);
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
