/* app.js — mikrointerakcje bez bibliotek (vanilla).
   Wymaga klas z style.css (.reveal, header.nav, dialog.video-modal, .video-trigger). */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1) Scroll-reveal — elementy .reveal wpływają w viewport */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* 2) Sticky-nav backdrop-blur po przewinięciu */
  function initNavBlur() {
    var nav = document.querySelector('header.nav');
    if (!nav) return;
    var ticking = false;
    function update() { nav.classList.toggle('scrolled', window.scrollY > 8); ticking = false; }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* 3) Modal wideo — lazy iframe YouTube (youtube-nocookie), usuwany przy zamknięciu */
  function initVideoModal() {
    var dialog = document.querySelector('dialog.video-modal');
    if (!dialog) return;
    var frame = dialog.querySelector('.video-frame');
    var lastTrigger = null;

    function open(id, trigger) {
      // Brak prawdziwego ID (placeholder) — nie otwieraj pustego playera.
      if (!id || id === 'VIDEO_ID') {
        alert('Wideo zostanie dodane wkrótce.');
        return;
      }
      lastTrigger = trigger || null;
      frame.innerHTML =
        '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
        '?autoplay=1&rel=0" title="Wideo" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    function close() {
      frame.innerHTML = '';
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    }

    document.querySelectorAll('.video-trigger').forEach(function (btn) {
      btn.addEventListener('click', function () { open(btn.dataset.yt, btn); });
    });
    dialog.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });
    dialog.addEventListener('cancel', function () { frame.innerHTML = ''; }); // Esc
  }

  /* 4) Rok w stopce */
  function initYear() {
    var y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* 5) Formularz — dopóki action="" (niepodłączony), nie wysyłaj pustego POST */
  function initForm() {
    var form = document.querySelector('.contact__form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      var action = (form.getAttribute('action') || '').trim();
      if (!action) {
        e.preventDefault();
        if (!form.reportValidity()) return;
        var existing = form.querySelector('.form-status');
        if (!existing) {
          var msg = document.createElement('p');
          msg.className = 'form-note form-status';
          msg.setAttribute('role', 'status');
          msg.textContent = 'Formularz nie jest jeszcze podłączony — napisz na olesiuk13@gmail.com.';
          form.appendChild(msg);
        }
      }
    });
  }

  function init() { initReveal(); initNavBlur(); initVideoModal(); initYear(); initForm(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
