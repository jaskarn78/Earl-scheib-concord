// Earl Scheib Of Concord - native booking (contact.html#book).
// Open times come live from the shop's Setmore calendar through the shop
// server; the booking goes straight into Setmore, which emails the
// confirmation. Vanilla JS, no build step. Needs js/main.js first (tracking).
(function () {
  "use strict";

  // The shop server that talks to Setmore. One place to change it.
  var BOOKING_API = "https://notify.earlscheibconcord.com";
  var PATH = "/earlscheibconcord/pub/booking";
  var TZ = "America/Los_Angeles";
  var MAX_DAYS = 60;
  var SLOT_CACHE_MS = 60 * 1000;
  var AUTO_TRIES = 8;            // first visit: look this many days ahead for the first open day
  var SETMORE_URL = "https://marcosris.setmore.com/marco";
  var ADDRESS = "2130 Market St, Concord, CA 94520";
  // Shop hours (Concord time), for the line under the day.
  var HOURS = { 1: "Open 8 AM to 4 PM", 2: "Open 8 AM to 4 PM", 3: "Open 8 AM to 4 PM",
    4: "Open 8 AM to 4 PM", 5: "Open 8 AM to 3 PM", 6: "Saturday by appointment" };

  var root = document.querySelector("[data-booking]");
  if (!root) return;

  // Local preview only: ?api=http://localhost:8200 points the widget at a test server.
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    var m = /[?&]api=([^&]+)/.exec(location.search);
    if (m) BOOKING_API = decodeURIComponent(m[1]).replace(/\/+$/, "");
  }

  function $(sel, el) { return (el || root).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || root).querySelectorAll(sel)); }
  function track(name, params) { if (typeof window.eswTrack === "function") window.eswTrack(name, params || {}); }

  var main = $("[data-bk-main]"), done = $("[data-bk-done]"), fail = $("[data-bk-fail]");
  var cal = $("[data-bk-cal]"), strip = $("[data-bk-strip]"), monthLabel = $("[data-bk-month-label]");
  var prevBtn = $("[data-bk-prev]"), nextBtn = $("[data-bk-next]");
  var timesBox = $("[data-bk-times]"), dayH = $("[data-bk-dayh]"), daySub = $("[data-bk-dsub]");
  var notice = $("[data-bk-notice]"), announceEl = $("[data-bk-announce]");
  var contBtn = $("[data-bk-continue]"), form = $("[data-bk-form]"), fieldset = $("[data-bk-fieldset]");
  var pickLabel = $("[data-bk-pick]"), changeBtn = $("[data-bk-change]"), submitBtn = $("[data-bk-submit]");
  var statusEl = $("[data-bk-status]"), formTitle = $("[data-bk-form-title]"), n3 = $("[data-bk-n3]");
  var desktop = window.matchMedia ? window.matchMedia("(min-width: 900px)") : { matches: true };

  // ---- dates: plain "YYYY-MM-DD" strings, arithmetic in UTC so the visitor's own zone never matters
  function concordToday() {
    try {
      var p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
      var o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      return o.year + "-" + o.month + "-" + o.day;
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }
  function toDate(iso) { var a = iso.split("-"); return new Date(Date.UTC(+a[0], +a[1] - 1, +a[2])); }
  function toIso(d) { return d.toISOString().slice(0, 10); }
  function addDays(iso, n) { var d = toDate(iso); d.setUTCDate(d.getUTCDate() + n); return toIso(d); }
  function dow(iso) { return toDate(iso).getUTCDay(); }
  function fmt(iso, opts) { opts.timeZone = "UTC"; return toDate(iso).toLocaleDateString("en-US", opts); }
  function longDay(iso) { return fmt(iso, { weekday: "long", month: "long", day: "numeric" }); }
  function shortDay(iso) { return fmt(iso, { weekday: "short", month: "short", day: "numeric" }); }
  function to24(label) {
    var m = /^(\d{1,2}):(\d{2})\s*([AP])M$/i.exec((label || "").trim());
    if (!m) return null;
    var h = (+m[1]) % 12 + (m[3].toUpperCase() === "P" ? 12 : 0);
    return (h < 10 ? "0" : "") + h + ":" + m[2];
  }

  var today = concordToday();
  var maxDay = addDays(today, MAX_DAYS);
  var state = { date: null, time: null, month: today.slice(0, 7), step: 1, loadSeq: 0, booking: false };
  var cache = {};       // iso -> { at, slots }

  function bookable(iso) { return iso >= today && iso <= maxDay && dow(iso) !== 0; }
  function knownFull(iso) { var c = cache[iso]; return !!(c && c.slots.length === 0); }

  function announce(msg) {
    announceEl.textContent = "";
    setTimeout(function () { announceEl.textContent = msg; }, 30);
  }

  // ---- talking to the shop server
  function request(method, path, body) {
    var ctl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 20000) : null;
    var opts = { method: method, mode: "cors", credentials: "omit", cache: "no-store" };
    if (ctl) opts.signal = ctl.signal;
    if (body) {
      // text/plain keeps this a "simple" CORS request (no preflight); the server reads JSON.
      opts.headers = { "Content-Type": "text/plain;charset=UTF-8" };
      opts.body = JSON.stringify(body);
    }
    return fetch(BOOKING_API + path, opts).then(function (res) {
      if (timer) clearTimeout(timer);
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { status: res.status, data: data || {} };
      });
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  function loadSlots(iso, fresh) {
    var c = cache[iso];
    if (!fresh && c && Date.now() - c.at < SLOT_CACHE_MS) return Promise.resolve(c.slots);
    return request("GET", PATH + "/slots?date=" + encodeURIComponent(iso)).then(function (r) {
      if (r.status === 200 && Array.isArray(r.data.slots)) {
        cache[iso] = { at: Date.now(), slots: r.data.slots };
        return r.data.slots;
      }
      var e = new Error("slots " + r.status);
      e.status = r.status;
      throw e;
    });
  }

  // ---- step 1: the day
  function dayLabel(iso) {
    var s = longDay(iso);
    if (iso === today) s += ", today";
    if (!bookable(iso)) s += dow(iso) === 0 ? ", closed" : ", not available";
    else if (knownFull(iso)) s += ", no open times";
    return s;
  }

  function renderMonth() {
    var first = state.month + "-01";
    var label = fmt(first, { month: "long", year: "numeric" });
    monthLabel.textContent = label;
    prevBtn.disabled = state.month <= today.slice(0, 7);
    nextBtn.disabled = state.month >= maxDay.slice(0, 7);
    var html = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(function (w) {
      return '<div class="bk-w" aria-hidden="true">' + w + "</div>";
    }).join("");
    var lead = dow(first);
    for (var i = 0; i < lead; i++) html += '<div aria-hidden="true"></div>';
    var d = first;
    while (d.slice(0, 7) === state.month) {
      var ok = bookable(d) && !knownFull(d);
      var cls = "bk-d" + (d === today ? " is-today" : "") + (bookable(d) && knownFull(d) ? " is-full" : "");
      html += '<button type="button" class="' + cls + '" data-day="' + d + '" aria-pressed="' + (d === state.date) + '"' +
        (ok ? "" : " disabled") + ' aria-label="' + dayLabel(d) + '">' + (+d.slice(8)) + "</button>";
      d = addDays(d, 1);
    }
    cal.innerHTML = html;
  }

  function renderStrip() {
    var html = "";
    for (var d = today; d <= maxDay; d = addDays(d, 1)) {
      var ok = bookable(d) && !knownFull(d);
      html += '<button type="button" class="bk-sd" data-day="' + d + '" aria-pressed="' + (d === state.date) + '"' +
        (ok ? "" : " disabled") + ' aria-label="' + dayLabel(d) + '"><span>' + fmt(d, { weekday: "short" }) +
        "</span><b>" + (+d.slice(8)) + "</b></button>";
    }
    strip.innerHTML = html;
    var sel = strip.querySelector('[aria-pressed="true"]');
    if (sel) strip.scrollLeft = Math.max(0, sel.offsetLeft - strip.offsetLeft - 8);
  }

  function renderDays() { renderMonth(); renderStrip(); }

  function onDayClick(e) {
    var b = e.target.closest("[data-day]");
    if (!b || b.disabled) return;
    selectDate(b.getAttribute("data-day"), { user: true });
  }
  cal.addEventListener("click", onDayClick);
  strip.addEventListener("click", onDayClick);
  prevBtn.addEventListener("click", function () { shiftMonth(-1); });
  nextBtn.addEventListener("click", function () { shiftMonth(1); });
  function shiftMonth(n) {
    var y = +state.month.slice(0, 4), mo = +state.month.slice(5, 7) - 1 + n;
    var d = new Date(Date.UTC(y, mo, 1));
    state.month = toIso(d).slice(0, 7);
    renderMonth();
  }

  // ---- step 2: the time
  function renderTimes(slots) {
    timesBox.innerHTML = "";
    if (!slots.length) {
      timesBox.innerHTML = '<p class="bk-empty">No open times this day. Please pick another day.</p>';
      return;
    }
    var groups = [["Morning", []], ["Afternoon", []]];
    slots.forEach(function (s) { groups[/AM$/i.test(s) ? 0 : 1][1].push(s); });
    groups.forEach(function (g, gi) {
      if (!g[1].length) return;
      var id = "bk-tg-" + gi;
      var lab = document.createElement("p");
      lab.className = "bk-lab";
      lab.id = id;
      lab.textContent = g[0];
      var grid = document.createElement("div");
      grid.className = "bk-times";
      grid.setAttribute("role", "group");
      grid.setAttribute("aria-labelledby", id);
      g[1].forEach(function (s) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "bk-tm";
        b.textContent = s;
        b.setAttribute("data-time", s);
        b.setAttribute("aria-pressed", String(s === state.time));
        grid.appendChild(b);
      });
      timesBox.appendChild(lab);
      timesBox.appendChild(grid);
    });
  }

  timesBox.addEventListener("click", function (e) {
    var b = e.target.closest("[data-time]");
    if (b) selectTime(b.getAttribute("data-time"));
  });

  function setNotice(msg) { notice.textContent = msg || ""; }

  function selectDate(iso, opts) {
    opts = opts || {};
    state.date = iso;
    if (opts.keepTime !== true) setTime(null);
    state.month = iso.slice(0, 7);
    if (!opts.keepNotice) setNotice("");
    renderDays();
    dayH.textContent = longDay(iso);
    daySub.textContent = (HOURS[dow(iso)] || "") + " · times shown are Concord time";
    var seq = ++state.loadSeq;
    timesBox.innerHTML = '<p class="bk-loading">Loading open times…</p>';
    return loadSlots(iso, opts.fresh).then(function (slots) {
      if (seq !== state.loadSeq) return;
      renderTimes(slots);
      renderDays();
      if (opts.user) announce(longDay(iso) + ": " + (slots.length ? slots.length + " open times." : "no open times."));
    }, function () {
      if (seq !== state.loadSeq) return;
      showFail("load");
    });
  }

  function setTime(t) {
    state.time = t;
    $$("[data-time]", timesBox).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-time") === t)); });
    var label = t ? shortDay(state.date) + " · " + t : "";
    fieldset.disabled = !t;
    contBtn.disabled = !t;
    n3.classList.toggle("is-dim", !t);
    pickLabel.textContent = t ? label : "Pick a time first";
    submitBtn.textContent = t ? "Book " + label : "Book your time";
  }

  function selectTime(t) {
    setTime(t);
    setNotice("");
    announce(shortDay(state.date) + " at " + t + " selected. " + (desktop.matches ? "Now fill in your details." : "Tap Continue."));
  }

  // ---- phone steps
  function setStep(n) {
    state.step = n;
    root.classList.remove("is-step-1", "is-step-2");
    root.classList.add("is-step-" + n);
    $$(".bk-prog li").forEach(function (li, i) { li.classList.toggle("is-on", i < n); });
  }
  contBtn.addEventListener("click", function () {
    if (!state.time) return;
    setStep(2);
    root.scrollIntoView({ block: "start" });
    formTitle.focus({ preventScroll: true });
  });
  changeBtn.addEventListener("click", function () {
    setStep(1);
    if (!desktop.matches) root.scrollIntoView({ block: "start" });
    var b = timesBox.querySelector('[aria-pressed="true"]') || timesBox.querySelector("[data-time]");
    if (b) b.focus(); else if (cal.querySelector('[aria-pressed="true"]')) cal.querySelector('[aria-pressed="true"]').focus();
  });

  // ---- step 3: details
  var EMAIL_RE = /^[^@\s<>"',;]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
  function digits10(v) {
    var d = (v || "").replace(/\D/g, "");
    if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
    return d.length === 10 && !/[01]/.test(d.charAt(0)) && !/[01]/.test(d.charAt(3)) ? d : "";
  }
  var phoneIn = form.elements.phone;
  phoneIn.addEventListener("blur", function () {
    var d = digits10(phoneIn.value);
    if (d) phoneIn.value = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  });

  function fieldEl(name) { return name === "need" ? $("[data-bk-need]") : form.elements[name]; }
  function setErr(name, msg) {
    var el = fieldEl(name), err = root.querySelector("#bk-" + name + "-err");
    if (el) { if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid"); }
    if (err) { err.textContent = msg || ""; err.hidden = !msg; }
  }
  function clearErrs() { ["name", "phone", "email", "year", "need", "heard", "notes"].forEach(function (n) { setErr(n, ""); }); }
  function setStatus(html) { statusEl.innerHTML = html || ""; }

  function needValue() { var r = form.querySelector('input[name="need"]:checked'); return r ? r.value : ""; }
  function collect() {
    var f = form.elements;
    return {
      date: state.date, time: state.time,
      name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(),
      year: f.year.value.trim(), make: f.make.value.trim(), model: f.model.value.trim(),
      need: needValue(), heard: f.heard.value, notes: f.notes.value.trim(), website: f.website.value
    };
  }
  function validate(p) {
    var errs = [];
    if (p.name.replace(/\s+/g, " ").length < 2) errs.push(["name", "Please enter your name."]);
    if (!digits10(p.phone)) errs.push(["phone", "Please enter a 10-digit US mobile number."]);
    if (!EMAIL_RE.test(p.email) || p.email.length > 120) errs.push(["email", "Please enter a valid email so we can send your confirmation."]);
    if (p.year && !/^(19|20)\d{2}$/.test(p.year)) errs.push(["year", "Please enter a 4-digit year."]);
    if (!p.need) errs.push(["need", "Pick what you need."]);
    if (p.notes.length > 500) errs.push(["notes", "Please keep notes under 500 characters."]);
    return errs;
  }
  function focusField(name) {
    var el = name === "need" ? form.querySelector('input[name="need"]') : form.elements[name];
    if (el && el.focus) el.focus();
  }

  var FAIL_SUBMIT = "We couldn't confirm your booking just now. Please try again, " +
    '<a class="bk-link" href="' + SETMORE_URL + '">book on our Setmore page</a> or call ' +
    '<a class="bk-link" href="tel:+19256097780">(925) 609-7780</a>.';

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (state.booking) return;
    if (!state.date || !state.time) { setStatus("Please pick a day and a time first."); return; }
    clearErrs();
    setStatus("");
    var p = collect();
    var errs = validate(p);
    if (errs.length) {
      errs.forEach(function (x) { setErr(x[0], x[1]); });
      setStatus(errs.length === 1 ? errs[0][1] : "Please check the highlighted fields.");
      focusField(errs[0][0]);
      return;
    }
    state.booking = true;
    submitBtn.disabled = true;
    var label = submitBtn.textContent;
    submitBtn.textContent = "Booking…";
    announce("Booking your time…");
    request("POST", PATH, p).then(function (r) {
      var d = r.data || {};
      if (r.status === 200 && d.ok) return showDone(p, d);
      if (r.status === 409 && d.error === "slot_taken") return slotTaken(d);
      if (r.status === 400 && d.field) {
        if (d.field === "date" || d.field === "time") {
          setStatus(d.message || "Please pick another time.");
          setStep(1);
          return;
        }
        setErr(d.field, d.message);
        setStatus(d.message || "Please check the highlighted field.");
        focusField(d.field);
        return;
      }
      if (r.status === 429) {
        setStatus('Too many tries from here. Please call <a class="bk-link" href="tel:+19256097780">(925) 609-7780</a>.');
        return;
      }
      track("booking_unavailable", { stage: "submit", status: r.status, page_path: location.pathname });
      setStatus(FAIL_SUBMIT);
    }, function () {
      track("booking_unavailable", { stage: "submit", status: 0, page_path: location.pathname });
      setStatus(FAIL_SUBMIT);
    }).then(function () {
      state.booking = false;
      submitBtn.disabled = false;
      if (submitBtn.textContent === "Booking…") submitBtn.textContent = label;
    });
  });

  function slotTaken(d) {
    var iso = d.date || state.date;
    cache[iso] = { at: Date.now(), slots: Array.isArray(d.slots) ? d.slots : [] };
    var msg = cache[iso].slots.length
      ? "Sorry, that time was just taken. Here are the open times for that day."
      : "Sorry, that time was just taken and the day is now full. Please pick another day.";
    setStatus("");
    setStep(1);
    selectDate(iso, { keepNotice: true });
    setNotice(msg);
    announce(msg);
    if (!desktop.matches) root.scrollIntoView({ block: "start" });
  }

  // ---- booked
  var lastBooking = null;
  function showDone(p, d) {
    var s = d.summary || {};
    lastBooking = { date: state.date, time: state.time, start: d.start, end: d.end, summary: s };
    $('[data-bk-sum="when"]').textContent = s.when || d.when || (shortDay(state.date) + " · " + state.time);
    $('[data-bk-sum="what"]').textContent = s.what || ("Free estimate · " + p.need);
    $('[data-bk-sum="vehicle"]').textContent = s.vehicle || [p.year, p.make, p.model].join(" ").trim() || "Not given";
    $('[data-bk-sum="where"]').textContent = s.where || "2130 Market St, Concord";
    $("[data-bk-done-lead]").textContent = "We emailed you a confirmation" + (p.email ? " at " + p.email : "") + ".";
    main.hidden = true;
    fail.hidden = true;
    done.hidden = false;
    root.scrollIntoView({ block: "start" });
    $("[data-bk-done-title]").focus({ preventScroll: true });
    if (!p.website) {
      // Lead conversion, same pattern as the website forms (js/main.js).
      if (typeof window.eswSetUserData === "function") window.eswSetUserData(p.name, p.email, p.phone);
      track("generate_lead", { form_id: "booking", lead_type: "online_booking", page_path: location.pathname });
      track("book_online_submit", { placement: "booking", need: p.need, heard: p.heard, page_path: location.pathname });
      // Google Ads lead conversion stays off until Jas decides (conversion tracking is his call).
      var ADS_CONVERSION_ON_BOOKING = false;
      if (ADS_CONVERSION_ON_BOOKING && typeof window.eswAdsConversion === "function" && typeof window.eswTags === "function") {
        window.eswAdsConversion(window.eswTags().ADS_LEAD_LABEL);
      }
    }
  }

  function icsText(b) {
    var start = (b.start || (b.date + "T" + to24(b.time))).replace(/[-:]/g, "") + "00";
    var endIso = b.end;
    if (!endIso) {
      var t = to24(b.time).split(":"), mins = +t[0] * 60 + +t[1] + 30;
      endIso = b.date + "T" + ("0" + Math.floor(mins / 60)).slice(-2) + ":" + ("0" + (mins % 60)).slice(-2);
    }
    var end = endIso.replace(/[-:]/g, "") + "00";
    var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    var esc = function (s) { return String(s || "").replace(/\\/g, "\\\\").replace(/[,;]/g, "\\$&").replace(/\n/g, "\\n"); };
    var desc = [b.summary.what, b.summary.vehicle ? "Vehicle: " + b.summary.vehicle : "",
      "Need to change it? Call (925) 609-7780."].filter(Boolean).join("\n");
    return [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Earl Scheib Of Concord//Booking//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VTIMEZONE", "TZID:America/Los_Angeles",
      "BEGIN:DAYLIGHT", "TZOFFSETFROM:-0800", "TZOFFSETTO:-0700", "TZNAME:PDT", "DTSTART:19700308T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU", "END:DAYLIGHT",
      "BEGIN:STANDARD", "TZOFFSETFROM:-0700", "TZOFFSETTO:-0800", "TZNAME:PST", "DTSTART:19701101T020000", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU", "END:STANDARD",
      "END:VTIMEZONE",
      "BEGIN:VEVENT",
      "UID:" + start + "-" + Math.random().toString(36).slice(2, 10) + "@earlscheibconcord.com",
      "DTSTAMP:" + stamp,
      "DTSTART;TZID=America/Los_Angeles:" + start,
      "DTEND;TZID=America/Los_Angeles:" + end,
      "SUMMARY:" + esc("Free estimate at Earl Scheib Of Concord"),
      "LOCATION:" + esc(ADDRESS),
      "DESCRIPTION:" + esc(desc),
      "END:VEVENT", "END:VCALENDAR", ""
    ].join("\r\n");
  }

  $("[data-bk-ics]").addEventListener("click", function () {
    if (!lastBooking) return;
    var blob = new Blob([icsText(lastBooking)], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "earl-scheib-estimate.ics";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
    track("booking_add_to_calendar", { page_path: location.pathname });
  });

  // ---- fallback when the shop server or Setmore can't be reached
  function showFail(stage) {
    main.hidden = true;
    done.hidden = true;
    fail.hidden = false;
    $("[data-bk-fail-msg]").textContent = "We couldn't load open times just now. Nothing was booked.";
    track("booking_unavailable", { stage: stage, page_path: location.pathname });
    if (location.hash === "#book") $("[data-bk-fail-title]").focus({ preventScroll: true });
  }
  $("[data-bk-retry]").addEventListener("click", function () {
    fail.hidden = true;
    main.hidden = false;
    cache = {};
    if (state.date) selectDate(state.date, { fresh: true }); else start();
  });

  // ---- first load: pick the first open day (today if it still has times)
  function start() {
    var d = today, tries = 0;
    while (!bookable(d)) d = addDays(d, 1);
    var seq = ++state.loadSeq;
    state.date = d;
    state.month = d.slice(0, 7);
    renderDays();
    dayH.textContent = longDay(d);
    daySub.textContent = (HOURS[dow(d)] || "") + " · times shown are Concord time";
    timesBox.innerHTML = '<p class="bk-loading">Loading open times…</p>';
    (function probe(iso) {
      loadSlots(iso).then(function (slots) {
        if (seq !== state.loadSeq) return;
        tries++;
        if (slots.length || tries >= AUTO_TRIES) { selectDate(iso); return; }
        var n = addDays(iso, 1);
        while (n <= maxDay && !bookable(n)) n = addDays(n, 1);
        if (n > maxDay) { selectDate(iso); return; }
        probe(n);
      }, function () {
        if (seq !== state.loadSeq) return;
        showFail("load");
      });
    })(d);
  }

  root.hidden = false;
  setTime(null);
  setStep(1);
  start();
})();
