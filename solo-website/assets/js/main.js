/* SOLO Network — interactions */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.remove("no-js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Page transition veil ---------- */
  var veil = document.querySelector(".page-veil");
  window.addEventListener("pageshow", function () { if (veil) veil.classList.remove("is-leaving"); });

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a || !veil || reduceMotion) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (!/\.html(#.*)?$/.test(href) || /^https?:/.test(href)) return;
    var samePage = href.split("#")[0] === location.pathname.split("/").pop();
    if (samePage) return;
    e.preventDefault();
    veil.classList.add("is-leaving");
    setTimeout(function () { window.location.href = href; }, 380);
  });

  /* ---------- Header, progress, back-to-top ---------- */
  var header = document.querySelector(".header");
  var progress = document.querySelector(".progress");
  var toTop = document.querySelector(".to-top");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    }
    if (toTop) toTop.classList.toggle("is-shown", y > 900);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector(".burger");
  var drawer = document.querySelector(".drawer");
  function setMenu(open) {
    if (!burger || !drawer) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
    if (open) { var first = drawer.querySelector("a"); if (first) first.focus(); }
  }
  if (burger) {
    burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
    drawer.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("is-open")) { setMenu(false); burger.focus(); } });
    window.addEventListener("resize", function () { if (window.innerWidth > 920) setMenu(false); });
  }

  /* ---------- Stagger indexes ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var items = group.querySelectorAll(":scope > [data-reveal], :scope > * > [data-reveal]");
    items.forEach(function (el, i) { el.style.setProperty("--i", i); });
  });
  document.querySelectorAll(".bars").forEach(function (b) {
    b.querySelectorAll(".bars__bar").forEach(function (bar, i) { bar.style.setProperty("--i", i); });
  });

  /* ---------- Count up ---------- */
  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || "";
    var prefix = el.dataset.prefix || "";
    if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
    var start = null, dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Reveal on scroll ---------- */
  var animated = document.querySelectorAll("[data-reveal], [data-animate], .timeline");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-visible");
        el.querySelectorAll("[data-count]").forEach(countUp);
        if (el.hasAttribute("data-count")) countUp(el);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    animated.forEach(function (el) { io.observe(el); });
  } else {
    animated.forEach(function (el) { el.classList.add("is-visible"); });
    document.querySelectorAll("[data-count]").forEach(countUp);
  }

  /* ---------- Tabs (WAI-ARIA) ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (!panel) return;
        if (on) {
          panel.hidden = false;
          panel.classList.remove("is-entering");
          void panel.offsetWidth;
          panel.classList.add("is-entering");
          panel.querySelectorAll("[data-animate]").forEach(function (a) { a.classList.add("is-visible"); });
        } else {
          panel.hidden = true;
        }
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  });

  /* ---------- Marquee: duplicate content for a seamless loop ---------- */
  document.querySelectorAll(".marquee__track").forEach(function (track) {
    Array.prototype.slice.call(track.children).forEach(function (child) {
      var clone = child.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
  });

  /* ---------- Mouse tilt on product windows ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (min-width: 921px)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var target = el.querySelector(".window") || el;
      el.addEventListener("mousemove", function (e) {
        if (!el.classList.contains("is-visible") && el.hasAttribute("data-reveal")) return;
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        target.style.transform = "rotateY(" + (x * 5).toFixed(2) + "deg) rotateX(" + (-y * 4).toFixed(2) + "deg)";
      });
      el.addEventListener("mouseleave", function () { target.style.transform = ""; });
    });
  }

  /* ---------- Rotating headline word ---------- */
  document.querySelectorAll(".rotator[data-words]").forEach(function (rot) {
    var words = rot.dataset.words.split("|");
    var word = rot.querySelector(".rotator__word");
    var i = 0;
    function fit() { rot.style.width = word.offsetWidth + "px"; }
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener("resize", fit);
    if (reduceMotion) return;
    setInterval(function () {
      word.classList.add("is-out");
      setTimeout(function () {
        i = (i + 1) % words.length;
        word.classList.remove("is-out");
        word.classList.add("is-in");
        word.textContent = words[i];
        fit();
        requestAnimationFrame(function () { requestAnimationFrame(function () { word.classList.remove("is-in"); }); });
      }, 450);
    }, 2800);
  });

  /* ---------- Contact form → email ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var subject = "SOLO enquiry — " + (d.get("org_type") || "General");
      var body = "Name: " + d.get("name") + "\nEmail: " + d.get("email") + "\nOrganisation: " + (d.get("org") || "-") + "\nType: " + (d.get("org_type") || "-") + "\n\n" + (d.get("message") || "");
      window.location.href = "mailto:hello@thesolo.network?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      var ok = form.querySelector(".form-success");
      if (ok) ok.classList.add("is-shown");
    });
  }

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
