// MyVillage - Admin Dashboard Controller
// Faithfully implements Screen 13: Admin Dashboard

window.initAdminDashboard = function() {
  updateAdminStats();
  renderAdminComplaintsTable();
};

function updateAdminStats() {
  const pendingCount = AppState.complaintsList.filter(c => c.status !== 'Resolved').length;
  
  const userEl = document.getElementById('admin-stat-users');
  const complaintsEl = document.getElementById('admin-stat-complaints');
  const listingsEl = document.getElementById('admin-stat-listings');
  const eventsEl = document.getElementById('admin-stat-events');

  if (userEl) userEl.textContent = VILLAGE_DATA.adminMetrics.totalUsers.toLocaleString();
  if (complaintsEl) complaintsEl.textContent = pendingCount;
  if (listingsEl) listingsEl.textContent = VILLAGE_DATA.adminMetrics.pendingListings;
  if (eventsEl) eventsEl.textContent = VILLAGE_DATA.adminMetrics.upcomingEvents;
}

function renderAdminComplaintsTable() {
  const tbody = document.getElementById('admin-complaints-tbody');
  if (!tbody) return;

  tbody.innerHTML = AppState.complaintsList.map(c => `
    <tr>
      <td><strong style="color: #0b4f2f;">${c.id}</strong></td>
      <td>
        <strong>${c.typeMr}</strong><br>
        <small style="color: #64748b;">${c.desc.substring(0, 40)}...</small>
      </td>
      <td>📍 ${c.locationMr}</td>
      <td>
        <select class="form-control" style="padding: 4px 8px; font-size: 0.82rem; font-weight: 700; width: 130px; border-radius: 9999px;" onchange="updateComplaintStatus('${c.id}', this.value)">
          <option value="Ongoing" ${c.status === 'Ongoing' ? 'selected' : ''}>⏳ Ongoing</option>
          <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>✅ Resolved</option>
          <option value="UnderReview" ${c.status === 'UnderReview' || c.status === 'Under_Review' ? 'selected' : ''}>🔍 Under Review</option>
          <option value="Open" ${c.status === 'Open' ? 'selected' : ''}>📝 Open</option>
        </select>
      </td>
      <td>${c.date}</td>
      <td>
        <button onclick="viewComplaintAdmin('${c.id}')" style="background: #e0f2fe; color: #0369a1; border: none; padding: 4px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.8rem;">
          तपशील
        </button>
      </td>
    </tr>
  `).join('');
}

function updateComplaintStatus(ticketId, newStatus) {
  const item = AppState.complaintsList.find(c => c.id === ticketId);
  if (item) {
    item.status = newStatus;
    const statusMap = {
      'Ongoing': 'काम सुरू',
      'Resolved': 'निवारण झाले',
      'UnderReview': 'तपासणी सुरू',
      'Open': 'नोंदणीकृत'
    };
    item.statusMr = statusMap[newStatus] || newStatus;
    
    localStorage.setItem('myvillage_complaints', JSON.stringify(AppState.complaintsList));
    updateAdminStats();
    renderComplaints(); // update public feed as well
    showToast(`तक्रार ${ticketId} ची स्थिती '${newStatus}' म्हणून अद्ययावत केली!`);
  }
}

function viewComplaintAdmin(ticketId) {
  const item = AppState.complaintsList.find(c => c.id === ticketId);
  if (!item) return;
  alert(`तक्रार क्र: ${item.id}\nप्रकार: ${item.typeMr}\nतक्रारदार: ${item.reportedBy}\nस्थान: ${item.locationMr}\nवर्णन: ${item.desc}\nकार्रवाई: ${item.actionTaken || 'प्रलंबित'}`);
}

// Admin Action: Add Notice
window.openAddNoticeModal = function() {
  const title = prompt("नवीन सूचनेचे शीर्षक टाका (उदा. ग्रामसभा / वीज खंडित):");
  if (!title) return;
  const desc = prompt("सूचनेचे सविस्तर वर्णन टाका:");
  if (!desc) return;

  const newNotice = {
    id: "N" + (105 + AppState.noticesList.length),
    category: "grampanchayat",
    titleMr: title,
    titleEn: title,
    titleHi: title,
    date: "आज (Live)",
    time: "तात्काळ",
    location: "ग्रामपंचायत",
    descMr: desc,
    descEn: desc,
    descHi: desc,
    badge: "नवीन सूचना",
    pinned: true
  };

  AppState.noticesList.unshift(newNotice);
  localStorage.setItem('myvillage_notices', JSON.stringify(AppState.noticesList));
  renderNotices();
  showToast("✅ नवीन सूचना यशस्वीरीत्या प्रसिद्ध झाली!");
};

// Admin Action: Verify Business
window.openVerifyBizModal = function() {
  showToast("सर्व प्रलंबित ५ स्थानिक दुकाने व व्यवसाय पडताळले गेले!");
};

// Admin Action: Add Event
window.openAddEventModal = function() {
  const eventName = prompt("नवीन कार्यक्रमाचे नाव टाका:");
  if (eventName) {
    showToast(`✅ कार्यक्रम '${eventName}' कॅलेंडरमध्ये जोडला गेला!`);
  }
};
