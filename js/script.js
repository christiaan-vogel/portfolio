document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('theme-toggle');
  const body   = document.body;

  // 1. Check saved theme or system preference
  const savedTheme    = localStorage.getItem('theme');
  const systemDark    = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const useDark       = savedTheme === 'dark' || (!savedTheme && systemDark);

  body.classList.toggle('dark-mode', useDark);
  body.classList.toggle('light-mode', !useDark);
  if (toggle) toggle.checked = useDark;

  // 2. On user toggle, save preference
  if (toggle) {
    toggle.addEventListener('change', () => {
      const darkNow = toggle.checked;
      body.classList.toggle('dark-mode', darkNow);
      body.classList.toggle('light-mode', !darkNow);
      localStorage.setItem('theme', darkNow ? 'dark' : 'light');
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const desktopToggle = document.getElementById('theme-toggle');
  const mobileToggle = document.getElementById('mobile-theme-toggle');
  const body = document.body;

  // THEME HANDLING (shared for desktop + mobile)
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const useDark = savedTheme === 'dark' || (!savedTheme && systemDark);

  function applyTheme(isDark) {
    body.classList.toggle('dark-mode', isDark);
    body.classList.toggle('light-mode', !isDark);
    if (desktopToggle) desktopToggle.checked = isDark;
    if (mobileToggle) mobileToggle.checked = isDark;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  applyTheme(useDark);

  // Attach listeners
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

  // MOBILE MENU
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenuButton = document.querySelector('.close-menu');
  const menuLinks = document.querySelectorAll('.menu-link');

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    if (menuButton) {
      menuButton.classList.add('open');
      menuButton.setAttribute('aria-expanded', 'true');
    }
    mobileMenu.setAttribute('aria-hidden', 'false');
    // prevent background scroll
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
    if (menuButton) {
      menuButton.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (menuButton) menuButton.focus();
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
    closeMenuButton.addEventListener('click', () => {
      closeMenu();
    });
  }

  // Close when clicking outside content
  if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMenu();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  // Close menu when a link is clicked
  menuLinks.forEach((lnk) => {
    lnk.addEventListener('click', () => {
      closeMenu();
    });
  });
});
