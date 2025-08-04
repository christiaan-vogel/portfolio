// ======== CORE BEHAVIORS ========
document.addEventListener('DOMContentLoaded', () => {
  // ---------- THEME HANDLING ----------
  const root          = document.documentElement;
  const desktopToggle = document.getElementById('theme-toggle');
  const mobileToggle  = document.getElementById('mobile-theme-toggle');
  const mq            = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(isDark, persist = true) {
    root.classList.toggle('dark-mode',  isDark);
    root.classList.toggle('light-mode', !isDark);
    if (desktopToggle) desktopToggle.checked = isDark;
    if (mobileToggle)  mobileToggle.checked  = isDark;
    if (persist) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  }

  (function initTheme() {
    const saved    = localStorage.getItem('theme');
    const useDark  = saved === 'dark' || (!saved && mq.matches);
    applyTheme(useDark, false);

    if (!saved) {
      const listener = e => applyTheme(e.matches, false);
      if (mq.addEventListener) mq.addEventListener('change', listener);
      else if (mq.addListener) mq.addListener(listener);
    }
  })();

  desktopToggle?.addEventListener('change', () => applyTheme(desktopToggle.checked));
  mobileToggle?.addEventListener('change',  () => applyTheme(mobileToggle.checked));

  // ---------- MOBILE MENU ----------
  const menuButton   = document.querySelector('.menu-button');
  const mobileMenu   = document.getElementById('mobile-menu');
  const closeMenuBtn = document.querySelector('.close-menu');
  const menuLinks    = document.querySelectorAll('.menu-link');

  function openMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden','false');
    menuButton.classList.add('open');
    menuButton.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
    setTimeout(() => mobileMenu.querySelector('.mobile-nav-links a')?.focus(), 100);
  }
  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden','true');
    menuButton.classList.remove('open');
    menuButton.setAttribute('aria-expanded','false');
    menuButton.focus();
    document.body.style.overflow = '';
  }

  menuButton?.addEventListener('click', () =>
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu()
  );
  closeMenuBtn?.addEventListener('click', closeMenu);
  mobileMenu?.addEventListener('click', e => {
    if (e.target === mobileMenu) closeMenu();
  });
  menuLinks.forEach(a => a.addEventListener('click', closeMenu));

  // ---------- MODAL LOGIC ----------
  const modal      = document.getElementById('modal');
  const modalBody  = document.getElementById('modal-body');
  const modalInner = modal?.querySelector('.modal-content');
  let lastFocus    = null;

  function openModalHTML(html) {
    lastFocus = document.activeElement;
    modalBody.innerHTML = html;
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';

    const heading = modalBody.querySelector('h1, h2, h3, [role="heading"]');
    if (heading) {
      heading.setAttribute('tabindex','-1');
      heading.focus();
    } else {
      modalBody.querySelector('button, a, [tabindex]')?.focus();
    }
  }
  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    lastFocus?.focus();
  }

  modal?.addEventListener('click', e => {
    if (e.target.matches('.close-btn') || e.target === modal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeMenu();
      closeModal();
    }
  });

  // expose for any inline handlers
  window.openModalHTML = openModalHTML;
  window.closeModal     = closeModal;

  // ---------- GESTURE CONTROL (TOUCH ONLY) ----------
  (function setupTouchGestures() {
    if (!modalInner) return;

    let dragging = false;
    let startX, startY, lastX, lastY, intent, wrapper;

    function onDown(x, y, target) {
      startX = lastX = x;
      startY = lastY = y;
      intent = null;
      wrapper = target.closest('.horizontal-scroll');
    }

    function onMove(x, y, e) {
      if (!dragging) return;
      const dxTotal = Math.abs(x - startX);
      const dyTotal = Math.abs(y - startY);
      const dx = x - lastX;
      const dy = y - lastY;

      if (!intent) {
        if (dyTotal > dxTotal + 5) intent = 'vertical';
        else if (dxTotal > dyTotal + 5) intent = 'horizontal';
        else return;
      }

      if (intent === 'vertical') {
        modalInner.scrollTop -= dy;
        e.preventDefault();
      } else if (intent === 'horizontal' && wrapper) {
        wrapper.scrollLeft -= dx;
        e.preventDefault();
      }

      lastX = x;
      lastY = y;
    }

    if (window.PointerEvent) {
      modalInner.addEventListener('pointerdown', e => {
        if (e.pointerType === 'touch') {
          dragging = true;
          onDown(e.clientX, e.clientY, e.target);
          modalInner.setPointerCapture(e.pointerId);
        }
      }, { passive: false });

      modalInner.addEventListener('pointermove', e => {
        if (dragging && e.pointerType === 'touch') {
          onMove(e.clientX, e.clientY, e);
        }
      }, { passive: false });

      modalInner.addEventListener('pointerup', e => {
        if (e.pointerType === 'touch') dragging = false;
      });
      modalInner.addEventListener('pointercancel', e => {
        if (e.pointerType === 'touch') dragging = false;
      });
    } else {
      modalInner.addEventListener('touchstart', e => {
        dragging = true;
        const t = e.touches[0];
        onDown(t.clientX, t.clientY, e.target);
      }, { passive: true });

      modalInner.addEventListener('touchmove', e => {
        const t = e.touches[0];
        onMove(t.clientX, t.clientY, e);
      }, { passive: false });

      modalInner.addEventListener('touchend',    () => { dragging = false; });
      modalInner.addEventListener('touchcancel', () => { dragging = false; });
    }
  })();
});
