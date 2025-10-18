// Theme Toggle Functionality
(function() {
  // Check for saved theme preference or default to 'dark'
  const currentTheme = localStorage.getItem('theme') || 'dark';
  
  // Apply theme on page load
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  // Create theme toggle button
  function createThemeToggle() {
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle theme');
    button.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
    button.onclick = toggleTheme;
    document.body.appendChild(button);
  }

  // Toggle theme function
  function toggleTheme() {
    const body = document.body;
    const button = document.querySelector('.theme-toggle');
    
    if (body.classList.contains('dark-mode')) {
      // Switch to light mode
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      button.innerHTML = '🌙';
    } else {
      // Switch to dark mode
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      button.innerHTML = '☀️';
    }
  }

  // Initialize theme toggle when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createThemeToggle);
  } else {
    createThemeToggle();
  }

  // Export toggle function for external use
  window.toggleTheme = toggleTheme;
})();
