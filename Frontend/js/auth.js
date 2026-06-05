// ── Logout ─────────────────────────────────────
    function logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    }

    // ── Get current logged in user ─────────────────
    function getCurrentUser() {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }

    // ── Guard: redirect to login if not logged in ──
    function requireAuth() {
      if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
      }
    }

    // ── Guard: redirect if not Admin ──────────────
    function requireAdmin() {
      const user = getCurrentUser();
      if (!user || user.role !== 'admin') {
        window.location.href = 'dashboard.html';
      }
    }

    // ── Render the shared navbar ───────────────────
    
function renderNavbar(activePage) {
  const user = getCurrentUser();
  if (!user) return;

  // Build nav links based on role
  let adminLink = '';

  if (user.role === 'admin') {
    adminLink = '<a href="users.html">Users</a>';
  }

  const navbar = `
    <nav class="navbar">
      <span class="logo">TMS</span>
      <div class="nav-links">
        <a href="dashboard.html">Dashboard</a>
        <a href="tasks.html">Tasks</a>
        ${adminLink}
      </div>
      
    <div style="display:flex; align-items:center; gap:12px;">

  <div style="position:relative; cursor:pointer;"
       onclick="toggleNotifications()">
    🔔
    <span id="notifBadge" style="
      position:absolute;
      top:-6px;
      right:-8px;
      background:#e53e3e;
      color:white;
      border-radius:50%;
      width:18px;
      height:18px;
      font-size:11px;
      display:none;
      align-items:center;
      justify-content:center;">
      0
    </span>
  </div>

  <span class="user-info">${user.name} (${user.role})</span>

  <button class="btn btn-secondary btn-sm"
          onclick="logout()">Logout</button>

</div>  
    </nav>
  `;

  // Insert navbar at the top of the body
  document.body.insertAdjacentHTML('afterbegin', navbar);
}

    