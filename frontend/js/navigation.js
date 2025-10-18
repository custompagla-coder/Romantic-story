// Hamburger menu toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');

  if (hamburgerBtn && navLinks) {
    // Toggle menu on hamburger click
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburgerBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navItems = navLinks.querySelectorAll('a, button');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburgerBtn.contains(e.target) && !navLinks.contains(e.target)) {
        if (navLinks.classList.contains('active')) {
          hamburgerBtn.classList.remove('active');
          navLinks.classList.remove('active');
        }
      }
    });
  }
});
