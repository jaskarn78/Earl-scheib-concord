// Earl Scheib of Concord — minimal vanilla JS
(function () {
  'use strict';

  // Mobile nav toggle
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('hidden') === false;
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('overflow-hidden', isOpen);
    });

    // Close mobile menu when clicking a link
    navMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth < 768) {
          navMenu.classList.add('hidden');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('overflow-hidden');
        }
      });
    });
  }

  // Highlight current nav item
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('[data-nav-link]').forEach(function (link) {
    const href = link.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === path || (href !== '/' && path.endsWith(href))) {
      link.classList.add('text-es-red');
      link.setAttribute('aria-current', 'page');
    }
  });

  // Contact form — graceful no-op since GH Pages is static.
  // Replace action URL with a real Formspree/Netlify endpoint when available.
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const status = form.querySelector('[data-form-status]');
      if (status) {
        status.textContent =
          'Thanks — your message is ready. The site is in preview mode; please call (925) 609-7780 or email info@earlscheibconcord.com directly until form delivery is connected.';
        status.classList.remove('hidden');
      }
    });
  }

  // Footer year
  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
