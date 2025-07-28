// script.js

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('theme-toggle');
  const body   = document.body;

  // 1. Initial theme
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const useDark    = savedTheme === 'dark' || (!savedTheme && systemDark);

  body.classList.toggle('dark-mode', useDark);
  body.classList.toggle('light-mode', !useDark);
  if (toggle) toggle.checked = useDark;

  // 2. Toggle theme
  if (toggle) {
    toggle.addEventListener('change', () => {
      const darkNow = toggle.checked;
      body.classList.toggle('dark-mode', darkNow);
      body.classList.toggle('light-mode', !darkNow);
      localStorage.setItem('theme', darkNow ? 'dark' : 'light');
    });
  }

  // 3. Mobile nav toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks   = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
});
