/* ============================================================
   F1 DELTA — access / paywall client helper
   Load as a NORMAL script (not text/babel) BEFORE the app scripts:
       <script src="/f1-access.js"></script>
   Exposes window.F1Access for the Pro page and the Subscribe box.
   ============================================================ */
(function () {
  var TOKEN_KEY = "f1delta_token";

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; }
  }
  function setToken(t) {
    try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); }
    catch (e) {}
  }

  // If we just came back from Stripe Checkout, trade the session_id for a token.
  async function consumeCheckoutReturn() {
    var params = new URLSearchParams(location.search);
    var sid = params.get("session_id");
    if (!sid) return;
    try {
      var res = await fetch("/api/verify-session?session_id=" + encodeURIComponent(sid));
      var data = await res.json();
      if (data && data.active && data.token) setToken(data.token);
    } catch (e) {}
    // strip session_id from the URL so it isn't left in history / sharable
    params.delete("session_id");
    var clean = location.pathname + (params.toString() ? "?" + params.toString() : "");
    history.replaceState({}, "", clean);
  }

  // Is the current visitor allowed in? Resolves to { active, email?, admin? }.
  async function check() {
    var token = getToken();
    if (!token) return { active: false };
    try {
      var res = await fetch("/api/check-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: token })
      });
      var data = await res.json();
      if (!data.active) setToken(""); // cancelled / expired — drop the stale token
      return data;
    } catch (e) {
      return { active: false };
    }
  }

  // Kick off Stripe Checkout. Redirects the browser to Stripe's page.
  async function subscribe(email) {
    var res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email || "" })
    });
    var data = await res.json();
    if (data && data.url) location.href = data.url;
    else throw new Error(data && data.error ? data.error : "checkout failed");
  }

  // Restore access on a new device by email (convenience-grade — see setup doc).
  async function restore(email) {
    var res = await fetch("/api/check-access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email })
    });
    var data = await res.json();
    if (data && data.active && data.token) setToken(data.token);
    return data;
  }

  function logout() { setToken(""); }

  // Run the checkout-return exchange right away; the Pro page awaits this.
  var ready = consumeCheckoutReturn();

  window.F1Access = {
    ready: ready,      // await F1Access.ready before the first check() on /pro
    check: check,
    subscribe: subscribe,
    restore: restore,
    logout: logout,
    hasToken: function () { return !!getToken(); }
  };
})();
