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

  // Contact form: AJAX submit to Formspree (works on static hosts like GH Pages).
  // Endpoint configured in the Formspree dashboard to forward to Marco's
  // shop email. Free tier accepts AJAX POSTs when the request sets
  // `Accept: application/json`.
  var FORM_ENDPOINT = "https://formspree.io/f/meevykpb";

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  var status = form.querySelector("[data-form-status]");
  var submitBtn = form.querySelector('button[type="submit"]');

  function setStatus(message, kind) {
    if (!status) return;
    status.textContent = message;
    status.className =
      "mt-3 text-sm " +
      (kind === "error" ? "text-red-600" : kind === "success" ? "text-green-700" : "text-zinc-600");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Required-field validation
    var fields = form.querySelectorAll("[required]");
    var ok = true;
    fields.forEach(function (f) {
      if (!f.value.trim()) {
        ok = false;
        f.style.borderColor = "#dc2626";
      } else {
        f.style.borderColor = "";
      }
    });
    if (!ok) {
      setStatus("Please fill every required field.", "error");
      return;
    }

    // Honeypot — bots fill hidden fields, humans don't
    var honeypot = form.querySelector('[name="_honey"]');
    if (honeypot && honeypot.value) {
      setStatus("Thanks — your message has been sent.", "success");
      return;
    }

    var name = (form.querySelector("[name=name]") || {}).value || "";
    var data = {
      name: name,
      phone: (form.querySelector("[name=phone]") || {}).value || "",
      email: (form.querySelector("[name=email]") || {}).value || "",
      vehicle: (form.querySelector("[name=vehicle]") || {}).value || "",
      message: (form.querySelector("[name=message]") || {}).value || "",
      _subject: "Free estimate request from " + name,
      _template: "table",
      _captcha: "false"
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.label = submitBtn.textContent;
      submitBtn.textContent = "Sending…";
    }
    setStatus("Sending your message…", "info");

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        return res.json().then(function (body) {
          return { ok: res.ok, status: res.status, body: body };
        });
      })
      .then(function (result) {
        var body = result.body || {};
        // Formspree returns {ok: true}; Formsubmit returns {success: "true"}.
        // Accept both so the relay can be swapped without breaking the success path.
        var ok = result.ok && (body.ok === true || body.success === true || body.success === "true");
        if (ok) {
          form.reset();
          setStatus(
            "Thanks! Your message has been sent. We'll be in touch within one business day. Need it sooner? Call (925) 609-7780.",
            "success"
          );
        } else {
          throw new Error(body.message || ("Submission failed (HTTP " + (result.status || "?") + ")"));
        }
      })
      .catch(function (err) {
        var detail = err && err.message ? " [debug: " + err.message + "]" : "";
        setStatus(
          "Something went wrong sending your message. Please call (925) 609-7780 or email info@earlscheibconcord.com directly." + detail,
          "error"
        );
      })
      .then(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.label || "Send message";
        }
      });
  });
})();
