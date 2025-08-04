// ---------- THEME HANDLING ----------
const root = document.documentElement;
const desktopToggle = document.getElementById('theme-toggle');
const mobileToggle = document.getElementById('mobile-theme-toggle');
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(isDark, persist = true) {
  root.classList.toggle('dark-mode', isDark);
  root.classList.toggle('light-mode', !isDark);
  if (desktopToggle) desktopToggle.checked = isDark;
  if (mobileToggle) mobileToggle.checked = isDark;
  if (persist) localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// initialize theme
(function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = mediaQuery.matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
  applyTheme(isDark, false);

  // if user hasn't explicitly chosen, respond to system changes
  if (!savedTheme) {
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', (e) => applyTheme(e.matches, false));
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener((e) => applyTheme(e.matches, false));
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
  document.body.style.overflow = 'hidden'; // lock background
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
    if (mobileMenu && mobileMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
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
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMenu();
    closeModal(); // also close modal if open
  }
});
menuLinks.forEach((lnk) => {
  lnk.addEventListener('click', () => {
    closeMenu();
  });
});

// ---------- MODAL LOGIC ----------
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

function openModalHTML(html) {
  if (!modal || !modalBody) return;
  modalBody.innerHTML = html;
  modal.style.display = 'block';
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // lock background scroll

  // focus management: focus heading if present, else first focusable
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
}

// clicking outside content
if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  // delegate close button if it's inside dynamic content
  modal.addEventListener('click', (e) => {
    if (e.target.matches('.close-btn')) {
      closeModal();
    }
  });
}

// expose to global if inline handlers rely on it
window.openModalHTML = openModalHTML;
window.closeModal = closeModal;

// prevent the outer page from stealing touch when inside modal-content
const modalContent = document.querySelector('.modal-content');
if (modalContent) {
  modalContent.addEventListener('touchmove', (e) => {
    e.stopPropagation(); // keep the scroll within the modal
  }, { passive: false });
}

// improve vertical scroll when starting over .horizontal-scroll
(function() {
  let startX = 0;
  let startY = 0;
  let isVertical = false;

  const modalContent = document.querySelector('.modal-content');
  if (!modalContent) return;

  document.querySelectorAll('.horizontal-scroll').forEach((wrapper) => {
    wrapper.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      isVertical = false;
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      const dx = Math.abs(t.clientX - startX);
      const dy = Math.abs(t.clientY - startY);

      // decide intent once: vertical if dy noticeably exceeds dx
      if (!isVertical && dy > dx + 5) {
        isVertical = true;
      }

      if (isVertical) {
        // take over vertical scroll for the modal
        e.preventDefault(); // stop horizontal-scroll from interfering
        const deltaY = startY - t.clientY;
        modalContent.scrollTop += deltaY;
        startY = t.clientY; // update for next increment
      }
      // if horizontal intent, do nothing so native horizontal scroll works
    }, { passive: false });
  });
})();
