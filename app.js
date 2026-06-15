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
    // Rewersywnie: pokaż przy wjeździe w kadr, schowaj przy wyjeździe (scroll w górę).
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle('is-visible', e.isIntersecting);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Liczby „doliczające się" przy wjeździe w kadr (count-up) */
  function initCountUp() {
    var nums = document.querySelectorAll('.stat__num[data-count]');
    if (!nums.length || reduceMotion || !('IntersectionObserver' in window)) return;

    function animate(el) {
      if (el.dataset.counting === '1') return;       // licz raz
      el.dataset.counting = '1';
      var raw = el.getAttribute('data-count');
      var isRange = raw.indexOf('-') > -1;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var thousands = el.hasAttribute('data-thousands');
      var lo = 0, hi;
      if (isRange) { var pr = raw.split('-'); lo = parseInt(pr[0], 10); hi = parseInt(pr[1], 10); }
      else { hi = parseInt(raw, 10); }
      var dur = 1100, startT = null;
      function fmt(n) { return thousands ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n); }
      function frame(t) {
        if (startT === null) startT = t;
        var prog = Math.min((t - startT) / dur, 1);
        var eased = 1 - Math.pow(1 - prog, 3);       // easeOutCubic
        if (isRange) el.textContent = prefix + Math.round(eased * lo) + '–' + Math.round(eased * hi) + suffix;
        else el.textContent = prefix + fmt(Math.round(eased * hi)) + suffix;
        if (prog < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) animate(e.target); });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
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

  /* 3b) Modal galerii projektów — zakładki projektów + karuzela zdjęć */
  function initProjectModal() {
    var dialog = document.querySelector('dialog.proj-modal');
    if (!dialog) return;
    var tabsEl = dialog.querySelector('.proj-tabs');
    var selectEl = dialog.querySelector('.proj-select');
    var carousel = dialog.querySelector('.proj-carousel');
    var track = dialog.querySelector('.proj-carousel__track');
    var dotsEl = dialog.querySelector('.proj-carousel__dots');
    var prevBtn = dialog.querySelector('.proj-carousel__nav--prev');
    var nextBtn = dialog.querySelector('.proj-carousel__nav--next');
    var detail = dialog.querySelector('.proj-detail');
    var lastTrigger = null;
    var slideIndex = 0, slideCount = 0;

    function updateCarousel() {
      track.style.transform = 'translateX(' + (-slideIndex * 100) + '%)';
      var dots = dotsEl.querySelectorAll('button');
      dots.forEach(function (d, i) { d.setAttribute('aria-current', i === slideIndex ? 'true' : 'false'); });
      var single = slideCount <= 1;
      prevBtn.hidden = single; nextBtn.hidden = single;
    }
    function goTo(i) {
      if (slideCount === 0) return;
      slideIndex = (i + slideCount) % slideCount;   // zawijanie
      updateCarousel();
    }

    function selectProject(item, allTabs, idx) {
      allTabs.forEach(function (t, i) { t.setAttribute('aria-selected', i === idx ? 'true' : 'false'); });
      if (selectEl) selectEl.value = String(idx);   // sync listy rozwijanej (mobile)
      // Slajdy z .proj-item__media
      track.innerHTML = '';
      var media = item.querySelector('.proj-item__media');
      var nodes = media ? media.children : [];
      slideCount = nodes.length;
      Array.prototype.forEach.call(nodes, function (n) { track.appendChild(n.cloneNode(true)); });
      // Kropki
      dotsEl.innerHTML = '';
      if (slideCount > 1) {
        for (var k = 0; k < slideCount; k++) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', 'Zdjęcie ' + (k + 1));
          (function (ki) { b.addEventListener('click', function () { goTo(ki); }); })(k);
          dotsEl.appendChild(b);
        }
      }
      // Opis
      var body = item.querySelector('.proj-item__body');
      detail.innerHTML = body ? body.innerHTML : '';
      detail.scrollTop = 0;
      slideIndex = 0;
      updateCarousel();
    }

    function open(dataId, trigger) {
      var data = document.getElementById(dataId);
      if (!data) return;
      var items = data.querySelectorAll('.proj-item');
      if (!items.length) return;
      lastTrigger = trigger || null;
      tabsEl.innerHTML = '';
      var tabBtns = [];
      items.forEach(function (item, i) {
        var t = document.createElement('button');
        t.type = 'button';
        t.className = 'proj-tab';
        t.setAttribute('role', 'tab');
        t.textContent = item.getAttribute('data-title') || ('Projekt ' + (i + 1));
        t.addEventListener('click', function () { selectProject(item, tabBtns, i); tabsEl.children[i].scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
        tabsEl.appendChild(t);
        tabBtns.push(t);
      });
      // Lista rozwijana (mobile) — ten sam zestaw projektów, z licznikiem „i/N"
      if (selectEl) {
        selectEl.innerHTML = '';
        var total = items.length;
        items.forEach(function (item, i) {
          var o = document.createElement('option');
          o.value = String(i);
          var title = item.getAttribute('data-title') || ('Projekt ' + (i + 1));
          o.textContent = (total > 1 ? (i + 1) + '/' + total + ' · ' : '') + title;
          selectEl.appendChild(o);
        });
        selectEl.onchange = function () {
          var i = parseInt(selectEl.value, 10) || 0;
          selectProject(items[i], tabBtns, i);
        };
      }
      selectProject(items[0], tabBtns, 0);
      document.body.style.overflow = 'hidden';
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    function close() {
      document.body.style.overflow = '';
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    }

    document.querySelectorAll('.proj-open').forEach(function (btn) {
      btn.addEventListener('click', function () { open(btn.dataset.projects, btn); });
    });
    prevBtn.addEventListener('click', function () { goTo(slideIndex - 1); });
    nextBtn.addEventListener('click', function () { goTo(slideIndex + 1); });
    dialog.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });
    dialog.addEventListener('cancel', function () { document.body.style.overflow = ''; }); // Esc
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(slideIndex - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(slideIndex + 1); }
    });
    // Swipe na dotyku
    var startX = null;
    carousel.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(slideIndex + (dx < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });
  }

  /* 4) Rok w stopce */
  function initYear() {
    var y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* 5) Poświata podążająca za kursorem w hero (tylko desktop, hover/pointer fine) */
  function initHeroGlow() {
    var hero = document.querySelector('.hero');
    var glow = hero && hero.querySelector('.hero__glow');
    if (!hero || !glow || reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var ticking = false;
    hero.addEventListener('pointermove', function (e) {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var r = hero.getBoundingClientRect();
        glow.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        glow.style.setProperty('--my', (e.clientY - r.top) + 'px');
        ticking = false;
      });
    }, { passive: true });
  }

  /* 6) Menu mobilne (hamburger) */
  function initNavToggle() {
    var nav = document.querySelector('header.nav');
    var btn = nav && nav.querySelector('.nav__toggle');
    var menu = nav && nav.querySelector('#nav-links');
    if (!nav || !btn || !menu) return;
    function setOpen(open) {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    }
    btn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  function init() { initReveal(); initNavBlur(); initVideoModal(); initProjectModal(); initYear(); initHeroGlow(); initCountUp(); initNavToggle(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
