// ======== CORE BEHAVIORS ========
document.addEventListener('DOMContentLoaded', () => {
  // ---------- THEME HANDLING ----------
  const root = document.documentElement;
  const desktopToggle = document.getElementById('theme-toggle');
  const mobileToggle = document.getElementById('mobile-theme-toggle');
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  let userHasSetTheme = Boolean(localStorage.getItem('theme'));

  function applyTheme(isDark, persist = true) {
    root.classList.toggle('dark-mode', isDark);
    root.classList.toggle('light-mode', !isDark);
    if (desktopToggle) desktopToggle.checked = isDark;
    if (mobileToggle) mobileToggle.checked = isDark;
    if (persist) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      userHasSetTheme = true;
    }
  }

  // initialize theme
  (function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = mediaQuery.matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    applyTheme(isDark, false);

    // respond to system changes only if user hasn't explicitly chosen
    if (!savedTheme) {
      const listener = (e) => {
        applyTheme(e.matches, false);
      };
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', listener);
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(listener);
      }
    }
  })();

  // toggle listeners
  if (desktopToggle) {
    desktopToggle.addEventListener('change', () => {
      applyTheme(desktopToggle.checked);
    });
  }
  if (mobileToggle) {
    mobileToggle.addEventListener('change', () => {
      applyTheme(mobileToggle.checked);
    });
  }

  // ---------- MOBILE MENU ----------
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenuButton = document.querySelector('.close-menu');
  const menuLinks = document.querySelectorAll('.menu-link');

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    if (menuButton) {
      menuButton.classList.add('open');
      menuButton.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
    // focus first link for accessibility
    setTimeout(() => {
      const firstLink = mobileMenu.querySelector('.mobile-nav-links a');
      if (firstLink) firstLink.focus();
    }, 100);
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (menuButton) {
      menuButton.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.focus();
    }
    document.body.style.overflow = '';
  }

  if (menuButton) {
    menuButton.addEventListener('click', () => {
      if (mobileMenu && mobileMenu.classList.contains('open')) closeMenu();
      else openMenu();
    });
  }

  if (closeMenuButton) {
    closeMenuButton.addEventListener('click', closeMenu);
  }

  if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMenu();
    });
  }

  menuLinks.forEach((lnk) => {
    lnk.addEventListener('click', () => {
      closeMenu();
    });
  });

  // ---------- MODAL LOGIC ----------
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  const modalContent = modal?.querySelector('.modal-content');
  let lastFocusedBeforeModal = null;

  function openModalHTML(html) {
    if (!modal || !modalBody) return;
    lastFocusedBeforeModal = document.activeElement;
    modalBody.innerHTML = html;
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // focus management
    const heading = modalBody.querySelector('h1, h2, h3, [role="heading"]');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    } else {
      const focusable = modalBody.querySelector('button, a, [tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus();
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedBeforeModal instanceof HTMLElement) lastFocusedBeforeModal.focus();
  }

  // clicking outside content or on close button
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
      if (e.target.matches('.close-btn')) closeModal();
    });
  }

  // escape key closes things
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      closeModal();
    }
  });

  // expose for legacy inline use
  window.openModalHTML = openModalHTML;
  window.closeModal = closeModal;

  // ---------- GESTURE/SCROLL INTENT (modal + horizontal) ----------
  (function setupGestureControl() {
    if (!modalContent) return;

    let startX = 0, startY = 0;
    let lastX = 0, lastY = 0;
    let intent = null; // 'vertical' or 'horizontal'
    let activeWrapper = null;

    const onDown = (x, y, target) => {
      startX = lastX = x;
      startY = lastY = y;
      intent = null;
      activeWrapper = target.closest('.horizontal-scroll');
    };

    const onMove = (x, y, e) => {
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
        modalContent.scrollTop -= dy; // invert so swipe up moves content down
        e.preventDefault();
      } else if (intent === 'horizontal' && activeWrapper) {
        activeWrapper.scrollLeft -= dx;
        e.preventDefault();
      }

      lastX = x;
      lastY = y;
    };

    // pointer events preferred
    if (window.PointerEvent) {
      modalContent.addEventListener('pointerdown', (e) => {
        onDown(e.clientX, e.clientY, e.target);
        modalContent.setPointerCapture?.(e.pointerId);
      }, { passive: false });

      modalContent.addEventListener('pointermove', (e) => {
        onMove(e.clientX, e.clientY, e);
      }, { passive: false });

      modalContent.addEventListener('pointerup', () => {
        intent = null;
        activeWrapper = null;
      });
      modalContent.addEventListener('pointercancel', () => {
        intent = null;
        activeWrapper = null;
      });
    } else {
      // fallback to touch events
      modalContent.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        onDown(t.clientX, t.clientY, e.target);
      }, { passive: true });

      modalContent.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        onMove(t.clientX, t.clientY, e);
      }, { passive: false });

      modalContent.addEventListener('touchend', () => {
        intent = null;
        activeWrapper = null;
      });
      modalContent.addEventListener('touchcancel', () => {
        intent = null;
        activeWrapper = null;
      });
    }
  })();
});
