// MyVillage - Mobile App Simulator Controller
// Controls all 15 screens inside the smartphone frame

const MobileSimulator = {
  currentScreenId: 2, // Default to Screen 2: Home Screen
  isDrawerOpen: false,

  screensMeta: [
    { id: 1, title: "1. Splash Screen", icon: "✨" },
    { id: 2, title: "2. Home Screen", icon: "🏠" },
    { id: 3, title: "3. Navigation Menu", icon: "☰" },
    { id: 4, title: "4. News & Notices", icon: "📢" },
    { id: 5, title: "5. Farmer Zone", icon: "🌾" },
    { id: 6, title: "6. Jobs & Education", icon: "💼" },
    { id: 7, title: "7. Business Directory", icon: "🏪" },
    { id: 8, title: "8. Complaints & Help", icon: "📝" },
    { id: 9, title: "9. Marketplace", icon: "🛒" },
    { id: 10, title: "10. Village Map", icon: "🗺️" },
    { id: 11, title: "11. Events & Gallery", icon: "🎉" },
    { id: 12, title: "12. Profile / Account", icon: "👤" },
    { id: 13, title: "13. Admin Dashboard", icon: "⚡" },
    { id: 14, title: "14. Login", icon: "🔐" },
    { id: 15, title: "15. Register", icon: "📋" }
  ]
};

// Initialize Mobile Simulator
window.initMobileSimulator = function() {
  renderScreenSelectorPills();
  setupPhoneNavListeners();
  showMobileScreen(MobileSimulator.currentScreenId);
  syncPhoneTime();
};

// Render Screen Selector Carousel Pills
function renderScreenSelectorPills() {
  const container = document.getElementById('sim-screens-carousel');
  if (!container) return;

  container.innerHTML = MobileSimulator.screensMeta.map(s => `
    <button class="screen-select-pill ${s.id === MobileSimulator.currentScreenId ? 'active' : ''}" data-screen="${s.id}" onclick="showMobileScreen(${s.id})">
      ${s.icon} ${s.title}
    </button>
  `).join('');
}

// Show a specific screen inside the smartphone frame
window.showMobileScreen = function(screenNum) {
  MobileSimulator.currentScreenId = screenNum;

  // Update carousel pill active state
  document.querySelectorAll('.screen-select-pill').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.screen) === screenNum);
    if (parseInt(btn.dataset.screen) === screenNum) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });

  // Hide all screens, show target
  document.querySelectorAll('.sim-screen').forEach(scr => scr.classList.remove('active'));
  const target = document.getElementById(`sim-screen-${screenNum}`);
  if (target) {
    target.classList.add('active');
  }

  // Update bottom nav active state
  updatePhoneBottomNav(screenNum);

  // Scroll phone inner container to top
  const phoneInner = document.getElementById('phone-screen-content');
  if (phoneInner) phoneInner.scrollTop = 0;
};

// Setup Phone Bottom Nav bar listeners
function setupPhoneNavListeners() {
  document.querySelectorAll('.phone-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const scr = parseInt(e.currentTarget.dataset.screen);
      if (scr) showMobileScreen(scr);
    });
  });
}

function updatePhoneBottomNav(screenNum) {
  document.querySelectorAll('.phone-nav-item').forEach(btn => {
    const s = parseInt(btn.dataset.screen);
    btn.classList.toggle('active', s === screenNum);
  });

  // Hide bottom nav on splash, login, register, and drawer
  const bottomNav = document.getElementById('phone-bottom-nav');
  if (bottomNav) {
    if ([1, 3, 13, 14, 15].includes(screenNum)) {
      bottomNav.style.display = 'none';
    } else {
      bottomNav.style.display = 'flex';
    }
  }
}

// Sync clock in status bar to real local time (9:41 or real time)
function syncPhoneTime() {
  const timeEl = document.getElementById('phone-status-time');
  if (!timeEl) return;
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  minutes = minutes < 10 ? '0' + minutes : minutes;
  timeEl.textContent = `${hours}:${minutes}`;
}

// Sync language switcher from phone drawer
window.syncMobileLanguage = function(lang) {
  document.querySelectorAll('.sim-drawer-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
};
