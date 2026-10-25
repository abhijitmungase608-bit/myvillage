// MyVillage - Smart Village Portal (आपलं गाव)
// Main Application Controller & Dynamic Renderer

// Current Application State
const AppState = {
  currentLang: 'mr', // 'mr' (Marathi), 'en' (English), 'hi' (Hindi)
  currentMode: 'portal', // 'portal', 'mobile', 'admin'
  currentSection: 'home',
  complaintsList: [...VILLAGE_DATA.complaints],
  marketplaceList: [...VILLAGE_DATA.marketplace],
  noticesList: [...VILLAGE_DATA.notices],
  businessesList: [...VILLAGE_DATA.businesses],
  selectedMapLocation: VILLAGE_DATA.mapLocations[0],
  currentUser: { ...VILLAGE_DATA.currentUser, isLoggedIn: false }
};

// Initialize App on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  setupEventListeners();
  renderAllSections();
  updateTranslations();
});

// Load from LocalStorage if available
function loadStoredData() {
  const savedLang = localStorage.getItem('myvillage_lang');
  if (savedLang && ['mr', 'en', 'hi'].includes(savedLang)) {
    AppState.currentLang = savedLang;
  }
  
  const savedComplaints = localStorage.getItem('myvillage_complaints');
  if (savedComplaints) {
    try {
      AppState.complaintsList = JSON.parse(savedComplaints);
    } catch (e) {
      console.error(e);
    }
  }

  const savedMarket = localStorage.getItem('myvillage_market');
  if (savedMarket) {
    try {
      AppState.marketplaceList = JSON.parse(savedMarket);
    } catch (e) {
      console.error(e);
    }
  }

  const savedNotices = localStorage.getItem('myvillage_notices');
  if (savedNotices) {
    try {
      AppState.noticesList = JSON.parse(savedNotices);
    } catch (e) {
      console.error(e);
    }
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Top Controller Mode Switcher
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mode = e.currentTarget.dataset.mode;
      setMode(mode);
    });
  });

  // Language Switcher Buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.currentTarget.dataset.lang;
      setLanguage(lang);
    });
  });

  // Portal Navigation Links
  document.querySelectorAll('.nav-link, .portal-nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.currentTarget.dataset.target;
      if (target) navigateToSection(target);
    });
  });

  // Quick Service Cards
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const target = e.currentTarget.dataset.section;
      if (target) navigateToSection(target);
    });
  });

  // Notice Filter Pills
  document.querySelectorAll('#notice-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#notice-pills .pill-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderNotices(e.currentTarget.dataset.filter);
    });
  });

  // Jobs Filter Pills
  document.querySelectorAll('#job-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#job-pills .pill-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderJobs(e.currentTarget.dataset.filter);
    });
  });

  // Business Directory Search & Filter
  const bizSearchInput = document.getElementById('biz-search-input');
  if (bizSearchInput) {
    bizSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      renderBusinesses(null, query);
    });
  }

  document.querySelectorAll('#biz-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#biz-pills .pill-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderBusinesses(e.currentTarget.dataset.filter);
    });
  });

  // Marketplace Filter Pills
  document.querySelectorAll('#market-pills .pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#market-pills .pill-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderMarketplace(e.currentTarget.dataset.filter);
    });
  });

  // Complaint Form Submission
  const complaintForm = document.getElementById('new-complaint-form');
  if (complaintForm) {
    complaintForm.addEventListener('submit', handleComplaintSubmit);
  }

  // Global Hero Search
  const heroSearchBtn = document.getElementById('hero-search-btn');
  const heroSearchInput = document.getElementById('hero-search-input');
  if (heroSearchBtn && heroSearchInput) {
    const runSearch = () => {
      const q = heroSearchInput.value.trim().toLowerCase();
      if (!q) return;
      if (q.includes('नोकरी') || q.includes('job') || q.includes('भर्ती')) {
        navigateToSection('jobs');
      } else if (q.includes('तक्रार') || q.includes('complaint')) {
        navigateToSection('complaints');
      } else if (q.includes('बाजार') || q.includes('भाव') || q.includes('शेती') || q.includes('mandi') || q.includes('farm')) {
        navigateToSection('farmer');
      } else if (q.includes('दुकान') || q.includes('व्यवसाय') || q.includes('business')) {
        navigateToSection('business');
      } else if (q.includes('खरेदी') || q.includes('विक्री') || q.includes('market') || q.includes('कांदा')) {
        navigateToSection('marketplace');
      } else {
        navigateToSection('notices');
      }
    };
    heroSearchBtn.addEventListener('click', runSearch);
    heroSearchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(); });
  }

  // SOS Emergency Button
  const sosBtn = document.getElementById('sos-btn');
  if (sosBtn) {
    sosBtn.addEventListener('click', () => openModal('sos-modal'));
  }

  // Auth Button
  const authBtn = document.getElementById('auth-btn');
  if (authBtn) {
    authBtn.addEventListener('click', () => openModal('login-modal'));
  }

  // Scroll Spy: Sync Active Section with Navigation
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const secId = entry.target.id.replace('section-', '');
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.target === secId);
          });
          document.querySelectorAll('.mobile-nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.target === secId);
          });
        }
      });
    }, { threshold: 0.25 });

    document.querySelectorAll('.view-section').forEach(sec => observer.observe(sec));
  }
}

// Switch Application Display Mode (Web Portal vs Mobile App vs Admin)
function setMode(mode) {
  AppState.currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  const portalContainer = document.getElementById('portal-wrapper');
  const mobileContainer = document.getElementById('mobile-simulator-wrapper');
  const adminContainer = document.getElementById('admin-layout-wrapper');

  if (portalContainer) portalContainer.style.display = (mode === 'portal') ? 'block' : 'none';
  if (mobileContainer) {
    mobileContainer.style.display = (mode === 'mobile') ? 'flex' : 'none';
    if (mode === 'mobile' && typeof window.initMobileSimulator === 'function') {
      window.initMobileSimulator();
    }
  }
  if (adminContainer) {
    adminContainer.style.display = (mode === 'admin') ? 'flex' : 'none';
    if (mode === 'admin' && typeof window.initAdminDashboard === 'function') {
      window.initAdminDashboard();
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Multi-language Switcher
function setLanguage(lang) {
  AppState.currentLang = lang;
  localStorage.setItem('myvillage_lang', lang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  updateTranslations();
  renderAllSections();

  // If in mobile simulator, sync it
  if (typeof window.syncMobileLanguage === 'function') {
    window.syncMobileLanguage(lang);
  }

  const langNames = { mr: 'मराठी', en: 'English', hi: 'हिंदी' };
  showToast(`भाषा बदलली: ${langNames[lang]}`);
}

// Update i18n text keys
function updateTranslations() {
  const dict = I18N[AppState.currentLang] || I18N['mr'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });
}

// Navigate between views in Portal Mode (Synced with desktop and mobile nav)
function navigateToSection(sectionId) {
  AppState.currentSection = sectionId;

  const targetSec = document.getElementById(`section-${sectionId}`);
  if (targetSec) {
    targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    targetSec.classList.add('section-highlight');
    setTimeout(() => targetSec.classList.remove('section-highlight'), 1000);
  }

  // Sync desktop navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.target === sectionId);
  });

  // Sync mobile bottom navigation tabs
  document.querySelectorAll('.mobile-nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.target === sectionId);
  });
}

// Mobile App Drawer Controls
window.toggleMobileDrawer = function() {
  const drawer = document.getElementById('mobile-app-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.toggle('open');
    overlay.classList.toggle('open');
  }
};

window.closeMobileDrawer = function() {
  const drawer = document.getElementById('mobile-app-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }
};

// Cycle Mobile Header Language (Marathi -> English -> Hindi)
window.toggleNextLanguage = function() {
  const langOrder = ['mr', 'en', 'hi'];
  const currentIndex = langOrder.indexOf(AppState.currentLang);
  const nextLang = langOrder[(currentIndex + 1) % langOrder.length];
  setLanguage(nextLang);
  const pill = document.getElementById('mobile-lang-toggle-btn');
  const labels = { mr: 'मराठी', en: 'EN', hi: 'हिंदी' };
  if (pill) pill.textContent = labels[nextLang];
};

// Map View Switcher for Kothe (Roadmap vs Satellite vs Local)
window.switchMapType = function(type) {
  document.querySelectorAll('.map-type-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-map-${type}`);
  if (activeBtn) activeBtn.classList.add('active');

  const gmapWrap = document.getElementById('kothe-google-map-wrap');
  const localWrap = document.getElementById('kothe-local-map-wrap');
  const iframe = document.getElementById('kothe-gmap-iframe');

  if (type === 'roadmap') {
    if (gmapWrap) gmapWrap.style.display = 'block';
    if (localWrap) localWrap.style.display = 'none';
    if (iframe) iframe.src = "https://maps.google.com/maps?q=19.3820027,74.9719621(Kothe+Village+Newasa)&t=&z=15&ie=UTF8&iwloc=B&output=embed";
  } else if (type === 'satellite') {
    if (gmapWrap) gmapWrap.style.display = 'block';
    if (localWrap) localWrap.style.display = 'none';
    if (iframe) iframe.src = "https://maps.google.com/maps?q=19.3820027,74.9719621(Kothe+Village+Newasa)&t=k&z=16&ie=UTF8&iwloc=B&output=embed";
  } else if (type === 'local') {
    if (gmapWrap) gmapWrap.style.display = 'none';
    if (localWrap) localWrap.style.display = 'block';
  }
};

// Render All Dynamic Sections
function renderAllSections() {
  renderNotices();
  renderMandiRates();
  renderJobs();
  renderBusinesses();
  renderMarketplace();
  renderComplaints();
  renderEvents();
  renderInteractiveMap();
}

// 1. Render Notices
function renderNotices(filter = 'all') {
  const container = document.getElementById('notices-container');
  const homePinnedContainer = document.getElementById('home-pinned-notices');
  const lang = AppState.currentLang;
  let items = AppState.noticesList;

  if (homePinnedContainer) {
    const pinnedItems = items.slice(0, 2);
    homePinnedContainer.innerHTML = pinnedItems.map(n => {
      const title = lang === 'en' ? n.titleEn : (lang === 'hi' ? n.titleHi : n.titleMr);
      const desc = lang === 'en' ? n.descEn : (lang === 'hi' ? n.descHi : n.descMr);
      return `
        <div class="notice-card ${n.pinned ? 'pinned' : ''}">
          <div>
            <div class="notice-top">
              <span class="notice-badge">${n.badge}</span>
              <span class="notice-date">📅 ${n.date}</span>
            </div>
            <h3 class="notice-title">${title}</h3>
            <p class="notice-desc">${desc}</p>
          </div>
          <div class="notice-footer">
            <span>📍 ${n.location}</span>
            <button class="notice-btn" onclick="openNoticeModal('${n.id}')">सविस्तर वाचा →</button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (!container) return;

  if (filter && filter !== 'all') {
    items = items.filter(n => n.category === filter);
  }

  container.innerHTML = items.map(n => {
    const title = lang === 'en' ? n.titleEn : (lang === 'hi' ? n.titleHi : n.titleMr);
    const desc = lang === 'en' ? n.descEn : (lang === 'hi' ? n.descHi : n.descMr);
    return `
      <div class="notice-card ${n.pinned ? 'pinned' : ''}">
        <div>
          <div class="notice-top">
            <span class="notice-badge">${n.badge}</span>
            <span class="notice-date">📅 ${n.date}</span>
          </div>
          <h3 class="notice-title">${title}</h3>
          <p class="notice-desc">${desc}</p>
        </div>
        <div class="notice-footer">
          <span>📍 ${n.location}</span>
          <button class="notice-btn" onclick="openNoticeModal('${n.id}')">सविस्तर वाचा →</button>
        </div>
      </div>
    `;
  }).join('');
}

// 2. Render APMC Mandi Rates
function renderMandiRates() {
  const tableBody = document.getElementById('mandi-table-body');
  if (!tableBody) return;

  const lang = AppState.currentLang;
  tableBody.innerHTML = VILLAGE_DATA.mandiRates.map(r => {
    const cropName = lang === 'en' ? r.cropEn : (lang === 'hi' ? r.cropHi : r.cropMr);
    const trendIcon = r.trend === 'up' ? '▲' : (r.trend === 'down' ? '▼' : '▬');
    return `
      <tr>
        <td><strong>${cropName}</strong> <br><small class="text-muted">${r.variety}</small></td>
        <td>₹${r.min.toLocaleString('en-IN')}</td>
        <td>₹${r.max.toLocaleString('en-IN')}</td>
        <td><strong>₹${r.avg.toLocaleString('en-IN')}</strong> / ${r.unit}</td>
        <td>
          <span class="trend-badge ${r.trend}">
            ${trendIcon} ${r.diff}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// 3. Render Jobs & Education
function renderJobs(filter = 'all') {
  const container = document.getElementById('jobs-container');
  if (!container) return;

  const lang = AppState.currentLang;
  let items = VILLAGE_DATA.jobs;
  if (filter && filter !== 'all') {
    items = items.filter(j => j.type === filter);
  }

  container.innerHTML = items.map(j => {
    const title = lang === 'en' ? j.titleEn : (lang === 'hi' ? j.titleHi : j.titleMr);
    const qual = lang === 'en' ? j.qualificationEn : j.qualificationMr;
    return `
      <div class="job-card">
        <div class="job-main-info">
          <div class="job-title-row">
            <h3 class="job-title">${title}</h3>
            ${j.tag ? `<span class="badge-new">${j.tag}</span>` : ''}
          </div>
          <div class="job-meta-row">
            <span class="job-meta-item">🏛️ ${j.org}</span>
            <span class="job-meta-item">📍 ${j.location}</span>
            <span class="job-meta-item">👥 ${j.posts}</span>
            <span class="job-meta-item">💰 ${j.stipend}</span>
          </div>
          <div style="font-size: 0.88rem; color: #475569;">
            <strong>पात्रता:</strong> ${qual}
          </div>
        </div>
        <div class="job-action-box">
          <span style="font-size: 0.8rem; color: #dc2626; font-weight: 700;">अंतिम तारीख: ${j.lastDate}</span>
          <button class="btn-apply" onclick="openJobModal('${j.id}')">माहिती व अर्ज</button>
        </div>
      </div>
    `;
  }).join('');
}

// 4. Render Local Businesses
function renderBusinesses(filter = null, query = '') {
  const container = document.getElementById('biz-container');
  if (!container) return;

  const lang = AppState.currentLang;
  let items = AppState.businessesList;

  if (filter && filter !== 'all') {
    items = items.filter(b => b.category === filter);
  }

  if (query) {
    items = items.filter(b => 
      b.nameMr.toLowerCase().includes(query) || 
      b.nameEn.toLowerCase().includes(query) ||
      b.ownerMr.toLowerCase().includes(query) ||
      b.addressMr.toLowerCase().includes(query)
    );
  }

  container.innerHTML = items.map(b => {
    const name = lang === 'en' ? b.nameEn : (lang === 'hi' ? b.nameHi : b.nameMr);
    const addr = lang === 'en' ? b.addressEn : b.addressMr;
    const cleanPhone = b.whatsapp.replace(/\D/g, '');
    const waText = encodeURIComponent(`नमस्कार ${b.ownerMr}, मी आपलं गाव पोर्टलवरून संपर्क करत आहे.`);
    return `
      <div class="biz-card">
        <div>
          <div class="biz-header">
            <div class="biz-avatar">🏪</div>
            <div class="biz-info">
              <h3>${name}</h3>
              <div class="biz-category">${b.categoryNameMr} • ⭐ ${b.rating}</div>
            </div>
          </div>
          <p class="biz-owner"><strong>संचालक:</strong> ${b.ownerMr} (${b.badge})</p>
          <p class="biz-location">📍 ${addr}</p>
          <p style="font-size: 0.8rem; color: #16a34a; margin-top: 4px;">🕒 ${b.timing}</p>
        </div>
        <div class="biz-card-footer">
          <span style="font-size: 0.85rem; font-weight: 700; color: #0284c7;">📞 ${b.phone}</span>
          <a href="https://wa.me/${cleanPhone}?text=${waText}" target="_blank" class="btn-whatsapp">
            <span>💬 WhatsApp</span>
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// 5. Render Marketplace
function renderMarketplace(filter = 'all') {
  const container = document.getElementById('marketplace-container');
  if (!container) return;

  const lang = AppState.currentLang;
  let items = AppState.marketplaceList;
  if (filter && filter !== 'all') {
    items = items.filter(m => m.category === filter);
  }

  container.innerHTML = items.map(m => {
    const title = lang === 'en' ? m.titleEn : (lang === 'hi' ? m.titleHi : m.titleMr);
    const cleanPhone = m.whatsapp.replace(/\D/g, '');
    const waText = encodeURIComponent(`नमस्कार, मी आपलं गाव मार्केटवरून '${title}' बद्दल विचारणा करत आहे.`);
    return `
      <div class="market-item-card">
        <div class="market-item-body">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span class="notice-badge">${m.categoryNameMr}</span>
            <small style="color:#64748b; font-size:0.75rem;">⏱️ ${m.timeAgoMr}</small>
          </div>
          <div class="market-item-price">${m.price} <small style="font-size:0.75rem; color:#64748b; font-weight:500;">${m.priceUnit || ''}</small></div>
          <h3 class="market-item-title">${title}</h3>
          <p style="font-size:0.85rem; color:#64748b; margin-bottom:10px;">${m.descMr}</p>
          <div class="market-item-seller">
            <div>👤 ${m.sellerMr}</div>
            <div>📍 ${m.locationMr}</div>
          </div>
        </div>
        <div class="market-item-actions">
          <a href="tel:${m.phone}" class="btn-market-contact btn-market-call">📞 कॉल करा</a>
          <a href="https://wa.me/${cleanPhone}?text=${waText}" target="_blank" class="btn-market-contact btn-market-whatsapp">💬 WhatsApp</a>
        </div>
      </div>
    `;
  }).join('');
}

// 6. Render Complaints Tracker Feed
function renderComplaints() {
  const container = document.getElementById('complaints-feed');
  if (!container) return;

  container.innerHTML = AppState.complaintsList.map(c => `
    <div class="complaint-ticket">
      <div class="ticket-header">
        <span class="ticket-id">${c.id} - ${c.typeMr}</span>
        <span class="status-pill ${c.status}">${c.statusMr || c.status}</span>
      </div>
      <p style="font-size: 0.9rem; color: #334155; margin-bottom: 6px;">${c.desc}</p>
      <div style="font-size: 0.8rem; color: #64748b; display: flex; justify-content: space-between; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
        <span>📍 ${c.locationMr} | तक्रारदार: ${c.reportedBy}</span>
        <span>📅 ${c.date}</span>
      </div>
      ${c.actionTaken ? `
        <div style="margin-top: 8px; background: #f8fafc; padding: 6px 10px; border-radius: 6px; font-size: 0.82rem; color: #0f766e; border-left: 3px solid #0f766e;">
          <strong>कार्रवाई:</strong> ${c.actionTaken}
        </div>
      ` : ''}
    </div>
  `).join('');
}

// 7. Render Events & Festivals
function renderEvents() {
  const container = document.getElementById('events-container');
  if (!container) return;

  const lang = AppState.currentLang;
  container.innerHTML = VILLAGE_DATA.events.map(e => {
    const title = lang === 'en' ? e.titleEn : (lang === 'hi' ? e.titleHi : e.titleMr);
    return `
      <div class="event-card">
        <img src="${e.image}" alt="${title}" class="event-card-img" />
        <div class="event-card-body">
          <div class="event-date-badge">📅 ${e.dateMr} • ${e.timeMr}</div>
          <h3 class="event-title">${title}</h3>
          <p style="font-size:0.88rem; color:#64748b; margin-bottom:12px;">${e.descMr}</p>
          <div style="font-size:0.82rem; color:#475569; display:flex; justify-content:space-between; border-top:1px solid #f1f5f9; padding-top:10px;">
            <span>📍 ${e.locationMr}</span>
            <span>👥 ${e.attendees}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 8. Render Interactive Village Map Canvas
function renderInteractiveMap() {
  const mapSvg = document.getElementById('village-svg-map');
  const detailsBox = document.getElementById('map-facility-details');
  if (!mapSvg) return;

  const locations = VILLAGE_DATA.mapLocations;
  let pinsHtml = '';

  locations.forEach(loc => {
    const isSelected = AppState.selectedMapLocation.id === loc.id;
    pinsHtml += `
      <g class="map-location-pin ${isSelected ? 'active' : ''}" data-id="${loc.id}" transform="translate(${loc.coords.x * 6.5 + 40}, ${loc.coords.y * 3.8 + 30})" onclick="selectMapPin('${loc.id}')">
        <circle r="18" fill="${isSelected ? '#f59e0b' : '#137547'}" stroke="#ffffff" stroke-width="3" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
        <text text-anchor="middle" dy="6" font-size="16">${loc.icon}</text>
        <rect x="-40" y="-32" width="80" height="20" rx="10" fill="#0f172a" opacity="0.85" />
        <text x="0" y="-18" text-anchor="middle" font-size="10" fill="#ffffff" font-weight="700">${loc.nameMr.split(' ')[0]}</text>
      </g>
    `;
  });

  const baseSvg = `
    <!-- Village River / Canal -->
    <path d="M 0 350 Q 250 280 450 380 T 700 420" fill="none" stroke="#60a5fa" stroke-width="24" stroke-linecap="round" opacity="0.7"/>
    <!-- Village Main Roads -->
    <path d="M 50 200 L 650 200" fill="none" stroke="#cbd5e1" stroke-width="18" stroke-linecap="round"/>
    <path d="M 350 40 L 350 440" fill="none" stroke="#cbd5e1" stroke-width="18" stroke-linecap="round"/>
    <path d="M 200 40 Q 250 200 500 380" fill="none" stroke="#e2e8f0" stroke-width="12" stroke-dasharray="6,6"/>
    <!-- Farm Land Green Patches -->
    <rect x="60" y="60" width="160" height="100" rx="12" fill="#dcfce7" opacity="0.6"/>
    <rect x="420" y="70" width="200" height="90" rx="12" fill="#dcfce7" opacity="0.6"/>
    <rect x="80" y="240" width="140" height="130" rx="12" fill="#dcfce7" opacity="0.6"/>
    <rect x="440" y="240" width="180" height="120" rx="12" fill="#dcfce7" opacity="0.6"/>
    <!-- Pins -->
    ${pinsHtml}
  `;

  mapSvg.innerHTML = baseSvg;
  updateMapDetailsBox();
}

function selectMapPin(locId) {
  const found = VILLAGE_DATA.mapLocations.find(l => l.id === locId);
  if (found) {
    AppState.selectedMapLocation = found;
    renderInteractiveMap();
  }
}

function updateMapDetailsBox() {
  const box = document.getElementById('map-facility-details');
  if (!box) return;
  const loc = AppState.selectedMapLocation;
  box.innerHTML = `
    <div>
      <div style="font-size: 2.2rem; margin-bottom: 8px;">${loc.icon}</div>
      <h3 style="font-size: 1.25rem; font-weight: 800; color: #0b4f2f; margin-bottom: 6px;">${loc.nameMr}</h3>
      <p style="font-size: 0.9rem; color: #475569; margin-bottom: 14px;">${loc.descMr}</p>
      <div style="font-size: 0.88rem; line-height: 1.8; color: #334155; background: #f8fafc; padding: 12px; border-radius: 8px;">
        <div>🕒 <strong>वेळ:</strong> ${loc.timing}</div>
        <div>👤 <strong>प्रमुख / संपर्क व्यक्ती:</strong> ${loc.officer}</div>
        <div>📞 <strong>हेल्पलाईन:</strong> <a href="tel:${loc.contact}" style="color: #0284c7; font-weight: 700;">${loc.contact}</a></div>
      </div>
    </div>
    <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
      <a href="https://maps.app.goo.gl/4MzqXqfZYtbzAM1K8" target="_blank" style="display: block; text-align: center; background: #0284c7; color: #fff; padding: 10px; border-radius: 9999px; font-weight: 700; text-decoration: none; font-size: 0.88rem; box-shadow: 0 2px 6px rgba(2,132,199,0.3);">
        🗺️ Google Maps App मध्ये कोठे गाव पहा
      </a>
      <a href="https://maps.google.com/?q=${encodeURIComponent(loc.nameMr + ' कोठे नेवासा अहिल्यानगर')}" target="_blank" style="display: block; text-align: center; background: #137547; color: #fff; padding: 9px; border-radius: 9999px; font-weight: 700; text-decoration: none; font-size: 0.85rem;">
        📍 या ठिकाणाचे थेट दिशानिर्देश मिळवा
      </a>
    </div>
  `;
}

// Handle Complaint Form Submission
function handleComplaintSubmit(e) {
  e.preventDefault();
  const typeSelect = document.getElementById('complaint-type-select');
  const descText = document.getElementById('complaint-desc-text');
  const wardInput = document.getElementById('complaint-ward-input');
  const reporterName = document.getElementById('complaint-reporter-name');

  const newTicketId = `#C${1025 + AppState.complaintsList.length}`;
  const newComplaint = {
    id: newTicketId,
    typeMr: typeSelect ? typeSelect.value : 'रस्ते दुरुस्ती',
    locationMr: wardInput && wardInput.value ? wardInput.value : 'प्रभाग क्र. ३',
    status: 'Open',
    statusMr: 'नोंदणीकृत',
    statusColor: 'secondary',
    date: 'आज (Live)',
    reportedBy: reporterName && reporterName.value ? reporterName.value : 'नागरिक',
    desc: descText ? descText.value : 'तक्रार प्राप्त झाली आहे.',
    actionTaken: 'तक्रार संबंधित ग्रामपंचायत विभागाकडे पाठवली आहे.'
  };

  AppState.complaintsList.unshift(newComplaint);
  localStorage.setItem('myvillage_complaints', JSON.stringify(AppState.complaintsList));

  // Reset form
  e.target.reset();

  renderComplaints();
  showToast(`✅ तक्रार नोंदवली गेली! तिकीट क्र: ${newTicketId}`);

  // Switch to status tab if on mobile
  const statusTab = document.getElementById('tab-complaints-status');
  if (statusTab) statusTab.click();
}

// Toast Notifications
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>📢</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Modal System
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

// Specific Modals
function openNoticeModal(noticeId) {
  const notice = AppState.noticesList.find(n => n.id === noticeId);
  if (!notice) return;

  const body = document.getElementById('notice-detail-body');
  if (body) {
    const lang = AppState.currentLang;
    const title = lang === 'en' ? notice.titleEn : (lang === 'hi' ? notice.titleHi : notice.titleMr);
    const desc = lang === 'en' ? notice.descEn : (lang === 'hi' ? notice.descHi : notice.descMr);
    body.innerHTML = `
      <div style="margin-bottom: 14px;">
        <span class="notice-badge">${notice.badge}</span>
        <span style="float: right; color: #64748b; font-size: 0.85rem;">📅 ${notice.date}</span>
      </div>
      <h2 style="font-size: 1.4rem; color: #0b4f2f; margin-bottom: 12px;">${title}</h2>
      <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 0.9rem; margin-bottom: 16px;">
        <div>📍 <strong>स्थळ:</strong> ${notice.location}</div>
        <div>🕒 <strong>वेळ:</strong> ${notice.time}</div>
      </div>
      <p style="font-size: 0.95rem; line-height: 1.7; color: #334155; margin-bottom: 20px;">${desc}</p>
      <button class="btn-submit-complaint" onclick="closeModal('notice-modal'); showToast('सूचना डाउनलोड झाली!')">
        📄 अधिकृत परिपत्रक (PDF) डाउनलोड करा
      </button>
    `;
    openModal('notice-modal');
  }
}

function openJobModal(jobId) {
  const job = VILLAGE_DATA.jobs.find(j => j.id === jobId);
  if (!job) return;

  const body = document.getElementById('job-detail-body');
  if (body) {
    body.innerHTML = `
      <h2 style="font-size: 1.35rem; color: #0b4f2f; margin-bottom: 8px;">${job.titleMr}</h2>
      <div style="color: #64748b; font-size: 0.9rem; margin-bottom: 14px;">🏛️ ${job.org} | 📍 ${job.location}</div>
      <div style="background: #ecfdf5; padding: 14px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #a7f3d0;">
        <div>💼 <strong>एकूण जागा:</strong> ${job.posts}</div>
        <div>💰 <strong>वेतन / स्टायपेंड:</strong> ${job.stipend}</div>
        <div>🎓 <strong>शैक्षणिक पात्रता:</strong> ${job.qualificationMr}</div>
        <div style="color: #dc2626; font-weight: 700; margin-top: 6px;">⏰ <strong>अंतिम मुदत:</strong> ${job.lastDate}</div>
      </div>
      <p style="font-size: 0.9rem; color: #475569; margin-bottom: 20px;">
        अर्ज करण्यासाठी आवश्यक कागदपत्रे: 10वी/12वी मार्कशीट, पदवी प्रमाणपत्र, आधार कार्ड, रहिवासी दाखला व पासपोर्ट फोटो.
      </p>
      <button class="btn-submit-complaint" onclick="closeModal('job-modal'); showToast('अर्ज लिंक उघडली!')">
        🚀 अधिकृत पोर्टलवर ऑनलाईन अर्ज करा
      </button>
    `;
    openModal('job-modal');
  }
}
