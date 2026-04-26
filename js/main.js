// Earl Scheib Of Concord — minimal vanilla JS

(function () {
  // mobile menu toggle
  var btn = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  // mark active nav
  var path = window.location.pathname.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
  document.querySelectorAll(".nav-link").forEach(function (a) {
    var href = (a.getAttribute("href") || "").replace(/index\.html$/, "").replace(/\/$/, "") || "/";
    if (href === path) a.setAttribute("aria-current", "page");
  });

  // contact form: client-side validation only (no backend on GH Pages)
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector("[data-form-status]");
      var fields = form.querySelectorAll("[required]");
      var ok = true;
      fields.forEach(function (f) {
        if (!f.value.trim()) { ok = false; f.style.borderColor = "#dc2626"; }
      });
      if (!ok) {
        status.textContent = "Please fill every required field.";
        status.className = "mt-3 text-sm text-red-600";
        return;
      }
      // Without a backend, fall back to mailto: handoff so messages still reach the shop.
      var name = form.querySelector("[name=name]").value;
      var email = form.querySelector("[name=email]").value;
      var phone = form.querySelector("[name=phone]").value;
      var msg = form.querySelector("[name=message]").value;
      var body =
        "Name: " + name + "%0D%0A" +
        "Phone: " + phone + "%0D%0A" +
        "Email: " + email + "%0D%0A%0D%0A" +
        encodeURIComponent(msg);
      window.location.href =
        "mailto:info@earlscheibconcord.com?subject=" +
        encodeURIComponent("Free estimate request from " + name) +
        "&body=" + body;
      status.textContent = "Opening your email app to send. If nothing happens, please call (925) 609-7780.";
      status.className = "mt-3 text-sm text-green-700";
    });
  }
})();
