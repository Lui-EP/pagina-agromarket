// Theme Toggle
function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Initialize theme on page load
initTheme();

// Add event listeners for theme toggle buttons
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleAuth = document.getElementById('theme-toggle-auth');
    const themeToggleDash = document.getElementById('theme-toggle-dash');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (themeToggleAuth) {
        themeToggleAuth.addEventListener('click', toggleTheme);
    }
    
    if (themeToggleDash) {
        themeToggleDash.addEventListener('click', toggleTheme);
    }
});

// Initialize localStorage if empty
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}
if (!localStorage.getItem('productos')) {
    localStorage.setItem('productos', JSON.stringify([]));
}
if (!localStorage.getItem('intereses')) {
    localStorage.setItem('intereses', JSON.stringify([]));
}
if (!localStorage.getItem('chats')) {
    localStorage.setItem('chats', JSON.stringify([]));
}

// Utility functions
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registrado'))
            .catch(err => console.log('Error al registrar Service Worker', err));
    });
}

// ===== Menú Hamburguesa =====
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar    = document.getElementById('sidebar');
  const closeBtn   = document.getElementById('close-btn');
  const overlay    = document.getElementById('menu-overlay');

  if (!menuToggle || !sidebar || !closeBtn || !overlay) return;

  // ====== Funciones ======
  const openMenu = () => {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.classList.add('menu-open');
    sidebar.setAttribute('aria-hidden', 'false');
  };

  const closeMenu = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
    sidebar.setAttribute('aria-hidden', 'true');
  };

  // ====== Eventos ======
  menuToggle.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  // 🔹 Cerrar automáticamente al hacer clic en cualquier enlace del menú
  document.querySelectorAll('#sidebar a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // 🔹 Cerrar con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (sidebar.classList.contains('open')) {
        e.preventDefault();
        closeMenu();
        menuToggle.focus(); // regresa el foco al botón
      }
    }
  });
});
